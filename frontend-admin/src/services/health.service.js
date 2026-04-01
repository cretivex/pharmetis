/**
 * Backend health check. GET /health is at app root (not under /api).
 */
const BASE_URL = (import.meta.env.VITE_API_URL || 'https://api.pharmetis.in/api').replace(/\/api\/?$/, '');

export async function checkHealth() {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      credentials: 'include',
    });
    const latency = Math.round(performance.now() - start);
    const ok = res.ok;
    const data = ok ? await res.json().catch(() => ({})) : null;
    return {
      healthy: ok,
      latency,
      data,
      status: res.status,
    };
  } catch (err) {
    const latency = Math.round(performance.now() - start);
    return { healthy: false, latency, error: err.message, status: 0 };
  }
}
