const SENSITIVE_KEYS = new Set([
  'password',
  'confirmPassword',
  'currentPassword',
  'newPassword',
  'refreshToken',
  'accessToken',
  'token',
  'otp',
  'code',
  'creditCard',
  'cvv',
]);

/**
 * Return a shallow clone of req body safe for logs (passwords and tokens redacted).
 */
export function sanitizeBodyForLog(body) {
  if (body == null || typeof body !== 'object') return body;
  if (Array.isArray(body)) {
    return body.map((item) =>
      item && typeof item === 'object' ? sanitizeBodyForLog(item) : item
    );
  }
  const out = {};
  for (const [key, value] of Object.entries(body)) {
    const lower = key.toLowerCase();
    // Encrypted login/register payloads: avoid logging ciphertext
    if (lower === 'data' && typeof value === 'string' && value.length > 32) {
      out[key] = '[redacted]';
    } else if (SENSITIVE_KEYS.has(lower) || lower.includes('password') || lower.includes('secret')) {
      out[key] = '[redacted]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = sanitizeBodyForLog(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}
