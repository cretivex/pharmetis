/**
 * API automation test runner (no extra deps).
 * Run: node api-tests.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

const USERS = {
  buyer: {
    email: process.env.BUYER_EMAIL || 'buyer1@healthcare.com',
    password: process.env.BUYER_PASSWORD || 'password123',
  },
  supplier: {
    email: process.env.SUPPLIER_EMAIL || 'vendor1@medipharma.com',
    password: process.env.SUPPLIER_PASSWORD || 'password123',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@pharmetis.com',
    password: process.env.ADMIN_PASSWORD || 'password123',
  },
};

const results = [];

function test(name, ok, details = '') {
  results.push({ name, ok, details });
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} ${name}${details ? ` — ${details}` : ''}`);
}

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch (_) {}
  return { status: res.status, json };
}

function tokenFrom(json) {
  return (
    json?.token ||
    json?.accessToken ||
    json?.data?.token ||
    json?.data?.accessToken ||
    null
  );
}

function idFrom(json) {
  return json?.id || json?.data?.id || null;
}

async function main() {
  console.log(`\nRunning API tests against ${BASE_URL}\n`);

  // 1) Register (buyer)
  const registerEmail = `loadtest_${Date.now()}@example.com`;
  const registerRes = await request('POST', '/api/auth/register', {
    email: registerEmail,
    password: 'Password123!',
    role: 'BUYER',
  });
  test(
    'POST /api/auth/register (buyer)',
    registerRes.status === 200 || registerRes.status === 201,
    `status=${registerRes.status}`
  );

  // 2) Login (buyer, supplier, admin)
  const buyerLogin = await request('POST', '/api/auth/login', USERS.buyer);
  const supplierLogin = await request('POST', '/api/auth/login', USERS.supplier);
  const adminLogin = await request('POST', '/api/auth/login', USERS.admin);

  const buyerToken = tokenFrom(buyerLogin.json);
  const supplierToken = tokenFrom(supplierLogin.json);
  const adminToken = tokenFrom(adminLogin.json);

  test('POST /api/auth/login (buyer)', buyerLogin.status === 200 && !!buyerToken, `status=${buyerLogin.status}`);
  test('POST /api/auth/login (supplier)', supplierLogin.status === 200 && !!supplierToken, `status=${supplierLogin.status}`);
  test('POST /api/auth/login (admin)', adminLogin.status === 200 && !!adminToken, `status=${adminLogin.status}`);

  if (!buyerToken || !supplierToken || !adminToken) {
    throw new Error('Required tokens missing; aborting remaining tests.');
  }

  // 3) Products list
  const productsRes = await request('GET', '/api/products');
  test('GET /api/products', productsRes.status === 200, `status=${productsRes.status}`);

  const firstProduct =
    productsRes.json?.data?.items?.[0] ||
    productsRes.json?.data?.products?.[0] ||
    productsRes.json?.data?.[0];
  const firstProductId = firstProduct?.id || null;

  // 4) Product creation auth + invalid input handling
  const unauthorizedCreate = await request('POST', '/api/products', {
    name: 'Unauthorized Product',
  });
  test(
    'POST /api/products (unauthorized blocked)',
    unauthorizedCreate.status === 401 || unauthorizedCreate.status === 403,
    `status=${unauthorizedCreate.status}`
  );

  const invalidCreate = await request(
    'POST',
    '/api/products',
    { name: '', dosageForm: 'TABLET' },
    supplierToken
  );
  test(
    'POST /api/products (invalid payload rejected)',
    invalidCreate.status >= 400,
    `status=${invalidCreate.status}`
  );

  const createProductPayload = {
    name: `k6-product-${Date.now()}`,
    dosageForm: 'TABLET',
    productType: 'FORMULATION',
    manufacturer: 'Load Test Labs',
    country: 'India',
    description: 'Created by api-tests.js',
    composition: 'Paracetamol',
    packagingType: 'Blister',
    shelfLife: '24 months',
    availability: 'IN_STOCK',
    price: 10,
  };
  const createProductRes = await request('POST', '/api/products', createProductPayload, supplierToken);
  test(
    'POST /api/products (supplier create)',
    createProductRes.status === 200 || createProductRes.status === 201,
    `status=${createProductRes.status}`
  );

  // 5) RFQ flow API coverage
  if (!firstProductId) {
    throw new Error('No product found to create RFQ.');
  }

  const createRfqRes = await request(
    'POST',
    '/api/buyer/rfqs',
    {
      title: `API Test RFQ ${Date.now()}`,
      notes: 'Created by api-tests.js',
      items: [{ productId: firstProductId, productName: firstProduct?.name || 'Product', quantity: '100', unit: 'units' }],
    },
    buyerToken
  );
  test('POST /api/buyer/rfqs', createRfqRes.status === 200 || createRfqRes.status === 201, `status=${createRfqRes.status}`);
  const rfqId = idFrom(createRfqRes.json);

  if (!rfqId) {
    throw new Error('RFQ ID missing; cannot continue quotation flow tests.');
  }

  const suppliersRes = await request('GET', '/api/suppliers');
  const supplierList = suppliersRes.json?.data?.items || suppliersRes.json?.data?.suppliers || suppliersRes.json?.data || [];
  const supplierProfile = Array.isArray(supplierList) ? supplierList[0] : null;
  const supplierId = supplierProfile?.id;

  const forwardRes = await request(
    'POST',
    `/api/rfqs/${rfqId}/send`,
    { supplierIds: supplierId ? [supplierId] : [] },
    adminToken
  );
  test('POST /api/rfqs/:id/send', forwardRes.status === 200 || forwardRes.status === 201, `status=${forwardRes.status}`);

  const quoteRes = await fetch(`${BASE_URL}/api/rfq-responses/${rfqId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${supplierToken}` },
    body: new URLSearchParams({
      items: JSON.stringify([
        { productId: firstProductId, productName: firstProduct?.name || 'Product', quantity: '100', unit: 'units', unitPrice: 5, totalPrice: 500, leadTime: '7 days' },
      ]),
      totalAmount: '500',
      currency: 'USD',
      notes: 'Automated API test quote',
    }),
  });
  let quoteJson = null;
  try {
    quoteJson = await quoteRes.json();
  } catch (_) {}
  test('POST /api/rfq-responses/:rfqId', quoteRes.status === 200 || quoteRes.status === 201, `status=${quoteRes.status}`);
  const quoteId = idFrom(quoteJson);

  if (!quoteId) {
    throw new Error('Quotation ID missing; cannot test accept endpoint.');
  }

  const reviewRes = await request(
    'PATCH',
    `/api/rfq-responses/${quoteId}/review`,
    { action: 'APPROVE', adminNotes: 'Approved by api-tests.js' },
    adminToken
  );
  test('PATCH /api/rfq-responses/:id/review', reviewRes.status === 200, `status=${reviewRes.status}`);

  const sendBuyerRes = await request('POST', `/api/rfq-responses/${quoteId}/send-to-buyer`, {}, adminToken);
  test('POST /api/rfq-responses/:id/send-to-buyer', sendBuyerRes.status === 200, `status=${sendBuyerRes.status}`);

  const acceptRes = await request('POST', `/api/buyer/quotations/${quoteId}/accept`, {}, buyerToken);
  test('POST /api/buyer/quotations/:id/accept', acceptRes.status === 200 || acceptRes.status === 201, `status=${acceptRes.status}`);

  // 6) Unauthorized access checks
  const unauthorizedProfile = await request('GET', '/api/users/profile');
  test(
    'GET /api/users/profile (unauthorized blocked)',
    unauthorizedProfile.status === 401 || unauthorizedProfile.status === 403,
    `status=${unauthorizedProfile.status}`
  );

  const failed = results.filter((r) => !r.ok).length;
  const passed = results.length - failed;

  console.log('\n----------------------------------------');
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('----------------------------------------\n');

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('\n❌ API test runner crashed:', err.message);
  process.exit(1);
});
