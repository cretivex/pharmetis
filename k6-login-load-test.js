import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
    checks: ['rate>0.95'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'max'],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const LOGIN_PAYLOAD = {
  email: __ENV.TEST_EMAIL || 'buyer1@healthcare.com',
  password: __ENV.TEST_PASSWORD || 'password123',
};
const USERS_JSON = __ENV.USERS_JSON || '';
const CREDENTIAL_POOL = (() => {
  if (!USERS_JSON) return [];
  try {
    const parsed = JSON.parse(USERS_JSON);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((u) => u && u.email && u.password);
  } catch (err) {
    console.error(`[credentials] invalid USERS_JSON: ${err.message}`);
    return [];
  }
})();

function randomPause(minSeconds = 0.5, maxSeconds = 1.5) {
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

function hasSessionCookie(res) {
  const raw = res?.headers?.['Set-Cookie'] || res?.headers?.['set-cookie'];
  if (!raw) return false;
  if (Array.isArray(raw)) return raw.some((v) => /refreshToken|accessToken|token/i.test(String(v)));
  return /refreshToken|accessToken|token/i.test(String(raw));
}

function logHttpError(step, res, body) {
  console.error(
    `[${step}] status=${res.status} url=${res.request?.url || 'n/a'} body=${String(body || '').slice(0, 400)}`
  );
}

function getCredentialForVu() {
  if (CREDENTIAL_POOL.length === 0) return LOGIN_PAYLOAD;
  const idx = (__VU - 1) % CREDENTIAL_POOL.length;
  return CREDENTIAL_POOL[idx];
}

export default function () {
  const credential = getCredentialForVu();
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(credential), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'login_only' },
  });

  const body = parseJson(res);
  const token = getTokenFromLoginBody(body);
  const cookieAuth = hasSessionCookie(res);

  const ok = check(res, {
    'login status 200/201': (r) => r.status === 200 || r.status === 201,
    'login returns token or auth cookie': () => !!token || cookieAuth,
  });

  if (!ok) {
    logHttpError('login-only', res, res.body);
  }

  randomPause();
}
