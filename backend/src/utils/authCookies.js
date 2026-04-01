import { env } from '../config/env.js';

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

/** Parse JWT-style duration e.g. 7d, 15m, 60s into milliseconds */
export function parseDurationToMs(value) {
  if (!value || typeof value !== 'string') return 7 * 24 * 60 * 60 * 1000;
  const m = /^(\d+)([smhd])$/i.exec(value.trim());
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  const mult = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return n * mult[u];
}

/**
 * Cookie flags for auth tokens. Local dev: httpOnly, Lax, non-secure.
 * Production: typically Secure; SameSite=None requires Secure (cross-site API + SPA).
 */
export function getAuthCookieBaseOptions() {
  const sameSiteRaw = (env.COOKIE_SAME_SITE || 'Lax').toLowerCase();
  const sameSite =
    sameSiteRaw === 'none' ? 'None' : sameSiteRaw === 'strict' ? 'Strict' : 'Lax';

  let secure = false;
  if (env.IS_PRODUCTION) {
    if (sameSite === 'None') {
      secure = true;
    } else {
      secure = !!env.COOKIE_SECURE;
    }
  }

  return {
    httpOnly: env.COOKIE_HTTP_ONLY !== false,
    secure,
    sameSite,
    path: '/',
  };
}

export function setAuthCookies(res, accessToken, refreshToken) {
  const accessMs = parseDurationToMs(env.JWT_EXPIRES_IN);
  const refreshMs = parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN);
  const base = getAuthCookieBaseOptions();
  res.cookie(ACCESS_COOKIE, accessToken, { ...base, maxAge: accessMs });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...base, maxAge: refreshMs });
}

export function clearAuthCookies(res) {
  const base = getAuthCookieBaseOptions();
  res.clearCookie(ACCESS_COOKIE, { ...base });
  res.clearCookie(REFRESH_COOKIE, { ...base });
}
