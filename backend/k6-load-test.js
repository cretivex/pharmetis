import http from 'k6/http';
import { check, sleep, fail } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'max'],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const LOGIN_PAYLOAD = {
  email: __ENV.TEST_EMAIL || 'buyer1@healthcare.com',
  password: __ENV.TEST_PASSWORD || 'password123',
};
const SEARCH_TERM = __ENV.SEARCH_TERM || 'cement';
const FALLBACK_PRODUCT_ID = __ENV.PRODUCT_ID || '123';
const CART_QTY = Number(__ENV.CART_QTY || 10);

function randomPause(minSeconds = 1, maxSeconds = 3) {
  sleep(minSeconds + Math.random() * (maxSeconds - minSeconds));
}

function parseJson(res) {
  try {
    return res.json();
  } catch (_) {
    return null;
  }
}

function getTokenFromLoginBody(body) {
  return (
    body?.token ||
    body?.accessToken ||
    body?.data?.token ||
    body?.data?.accessToken ||
    body?.data?.tokens?.accessToken ||
    null
  );
}

function getProductId(productsBody) {
  const list =
    productsBody?.data?.items ||
    productsBody?.data?.products ||
    productsBody?.data ||
    productsBody?.items ||
    productsBody?.products ||
    [];

  if (Array.isArray(list) && list.length > 0) {
    const first = list[0];
    return first?.id || first?._id || first?.productId || FALLBACK_PRODUCT_ID;
  }

  return FALLBACK_PRODUCT_ID;
}

function logHttpError(step, res, body) {
  console.error(
    `[${step}] status=${res.status} url=${res.request?.url || 'n/a'} body=${String(body || '').slice(0, 400)}`
  );
}

function hasSessionCookie(res) {
  const raw = res?.headers?.['Set-Cookie'] || res?.headers?.['set-cookie'];
  if (!raw) return false;
  if (Array.isArray(raw)) return raw.some((v) => /refreshToken|accessToken|token/i.test(String(v)));
  return /refreshToken|accessToken|token/i.test(String(raw));
}


export function setup() {
  // Login once and share token across VUs
  const loginPayload = JSON.stringify(LOGIN_PAYLOAD);

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'login' },
  });

  const loginOk = check(loginRes, {
    'login status is 200/201': (r) => r.status === 200 || r.status === 201,
  });
  const loginBody = parseJson(loginRes);
  if (!loginOk) {
    logHttpError('login', loginRes, loginRes.body);
    fail('Login failed in setup().');
  }

  const token = getTokenFromLoginBody(loginBody);
  const cookieAuth = hasSessionCookie(loginRes);
  if (!token && !cookieAuth) {
    logHttpError('login-auth', loginRes, loginRes.body);
    fail('No JWT token and no auth cookie found in setup() login response.');
  }
  return { token: token || null, cookieAuth };
}

export default function (data) {
  const token = data?.token;

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (token) authHeaders.headers.Authorization = `Bearer ${token}`;

  randomPause();

  // 2) Browse products
  const productsRes = http.get(`${BASE_URL}/api/products`, {
    tags: { endpoint: 'products_list' },
  });
  const productsOk = check(productsRes, {
    'products status is 200': (r) => r.status === 200,
  });
  const productsBody = parseJson(productsRes);
  if (!productsOk) {
    logHttpError('products-list', productsRes, productsRes.body);
  }

  const productId = getProductId(productsBody);

  randomPause();

  // 3) Search products
  const searchRes = http.get(
    `${BASE_URL}/api/products?search=${encodeURIComponent(SEARCH_TERM)}`,
    { tags: { endpoint: 'products_search' } }
  );
  const searchOk = check(searchRes, {
    'search status is 200': (r) => r.status === 200,
  });
  if (!searchOk) {
    logHttpError('products-search', searchRes, searchRes.body);
  }

  randomPause();

  // 4) Authenticated profile check (real endpoint in this backend)
  const profileRes = http.get(`${BASE_URL}/api/users/profile`, {
    ...authHeaders,
    tags: { endpoint: 'users_profile' },
  });
  const profileOk = check(profileRes, {
    'profile status is 200': (r) => r.status === 200,
  });
  if (!profileOk) {
    logHttpError('users-profile', profileRes, profileRes.body);
  }

  randomPause();

  // 5) Session probe for authenticated user (real endpoint in this backend)
  const orderRes = http.get(`${BASE_URL}/api/auth/me`, {
    ...authHeaders,
    tags: { endpoint: 'auth_me' },
  });
  const orderOk = check(orderRes, {
    'auth me status is 200': (r) => r.status === 200,
  });
  if (!orderOk) {
    logHttpError('auth-me', orderRes, orderRes.body);
  }

  randomPause(1, 2);
}
