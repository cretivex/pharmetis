import http from 'k6/http';
import { check, sleep, fail } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 150 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

const USERS = {
  buyer: {
    email: __ENV.BUYER_EMAIL || 'buyer1@healthcare.com',
    password: __ENV.BUYER_PASSWORD || 'password123',
  },
  admin: {
    email: __ENV.ADMIN_EMAIL || 'admin@pharmetis.com',
    password: __ENV.ADMIN_PASSWORD || 'password123',
  },
  supplier: {
    email: __ENV.SUPPLIER_EMAIL || 'vendor1@medipharma.com',
    password: __ENV.SUPPLIER_PASSWORD || 'password123',
  },
};

function tokenFrom(body) {
  return (
    body?.token ||
    body?.accessToken ||
    body?.data?.token ||
    body?.data?.accessToken ||
    null
  );
}

function idFrom(body) {
  return body?.id || body?.data?.id || null;
}

function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
}

function login(label, creds) {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: creds.email, password: creds.password }),
    { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: `login_${label}` } }
  );
  const ok = check(res, { [`${label} login 200`]: (r) => r.status === 200 });
  if (!ok) fail(`${label} login failed: ${res.body}`);
  const body = res.json();
  const token = tokenFrom(body);
  if (!token) fail(`${label} token missing: ${res.body}`);
  const userId = body?.data?.user?.id || null;
  return { token, userId };
}

export function setup() {
  const buyer = login('buyer', USERS.buyer);
  const admin = login('admin', USERS.admin);
  const supplier = login('supplier', USERS.supplier);

  // Get one product ID for RFQ item payload
  const productsRes = http.get(`${BASE_URL}/api/products`, { tags: { endpoint: 'products_setup' } });
  const productsOk = check(productsRes, { 'products setup 200': (r) => r.status === 200 });
  if (!productsOk) fail(`products setup failed: ${productsRes.body}`);
  const productsBody = productsRes.json();
  const firstProduct = productsBody?.data?.items?.[0] || productsBody?.data?.products?.[0] || productsBody?.data?.[0];
  const productId = firstProduct?.id;
  const productName = firstProduct?.name || 'Sample Product';
  if (!productId) fail('No product ID found for RFQ setup');

  // Get supplier profile ID for admin send endpoint
  const suppliersRes = http.get(`${BASE_URL}/api/suppliers`, { tags: { endpoint: 'suppliers_setup' } });
  const suppliersOk = check(suppliersRes, { 'suppliers setup 200': (r) => r.status === 200 });
  if (!suppliersOk) fail(`suppliers setup failed: ${suppliersRes.body}`);
  const suppliersBody = suppliersRes.json();
  const supplierList = suppliersBody?.data?.items || suppliersBody?.data?.suppliers || suppliersBody?.data || [];
  const supplierProfile =
    (Array.isArray(supplierList) && supplierList.find((s) => s.userId === supplier.userId)) ||
    (Array.isArray(supplierList) && supplierList[0]) ||
    null;
  const supplierId = supplierProfile?.id || null;

  return {
    buyerToken: buyer.token,
    adminToken: admin.token,
    supplierToken: supplier.token,
    productId,
    productName,
    supplierId,
  };
}

export default function (data) {
  const buyer = authHeaders(data.buyerToken);
  const admin = authHeaders(data.adminToken);
  const supplier = authHeaders(data.supplierToken);

  // 1) Buyer -> Create RFQ
  const rfqPayload = {
    title: `Load Test RFQ ${__VU}-${Date.now()}`,
    notes: 'Automated k6 workflow test',
    items: [
      {
        productId: data.productId,
        productName: data.productName,
        quantity: '100',
        unit: 'units',
      },
    ],
  };
  const rfq = http.post(`${BASE_URL}/api/buyer/rfqs`, JSON.stringify(rfqPayload), {
    ...buyer,
    tags: { endpoint: 'buyer_create_rfq' },
  });
  check(rfq, { 'rfq created': (r) => r.status === 200 || r.status === 201 });
  const rfqId = idFrom(rfq.json());
  if (!rfqId) fail(`RFQ ID missing: ${rfq.body}`);

  sleep(1);

  // 2) Admin -> Send RFQ to supplier(s)
  const sendPayload = data.supplierId ? { supplierIds: [data.supplierId] } : { supplierIds: [] };
  const forward = http.post(`${BASE_URL}/api/rfqs/${rfqId}/send`, JSON.stringify(sendPayload), {
    ...admin,
    tags: { endpoint: 'admin_send_rfq' },
  });
  check(forward, { 'rfq forwarded': (r) => r.status === 200 || r.status === 201 });

  sleep(1);

  // 3) Supplier -> Submit quotation
  const quotePayload = {
    items: JSON.stringify([
      {
        productId: data.productId,
        productName: data.productName,
        quantity: '100',
        unit: 'units',
        unitPrice: 5,
        totalPrice: 500,
        leadTime: '7 days',
      },
    ]),
    totalAmount: '500',
    currency: 'USD',
    notes: 'Automated k6 quotation',
  };
  const quote = http.post(`${BASE_URL}/api/rfq-responses/${rfqId}`, quotePayload, {
    headers: { Authorization: `Bearer ${data.supplierToken}` },
    tags: { endpoint: 'supplier_quote' },
  });
  check(quote, { 'quotation sent': (r) => r.status === 200 || r.status === 201 });
  const quoteId = idFrom(quote.json());
  if (!quoteId) fail(`Quotation ID missing: ${quote.body}`);

  sleep(1);

  // 4) Admin -> Review + send to buyer
  const review = http.patch(
    `${BASE_URL}/api/rfq-responses/${quoteId}/review`,
    JSON.stringify({ action: 'APPROVE', adminNotes: 'Approved by k6 workflow' }),
    { ...admin, tags: { endpoint: 'admin_review_quote' } }
  );
  check(review, { 'quotation reviewed': (r) => r.status === 200 });

  const sendToBuyer = http.post(
    `${BASE_URL}/api/rfq-responses/${quoteId}/send-to-buyer`,
    JSON.stringify({}),
    { ...admin, tags: { endpoint: 'admin_send_quote_to_buyer' } }
  );
  check(sendToBuyer, { 'quotation sent to buyer': (r) => r.status === 200 });

  sleep(1);

  // 5) Buyer -> Accept quotation
  const accept = http.post(
    `${BASE_URL}/api/buyer/quotations/${quoteId}/accept`,
    JSON.stringify({}),
    { ...buyer, tags: { endpoint: 'buyer_accept_quote' } }
  );
  check(accept, { 'quote accepted': (r) => r.status === 200 || r.status === 201 });

  sleep(2);
}
