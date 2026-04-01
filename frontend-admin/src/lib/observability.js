/**
 * Central error logging for production. No console.log in production.
 * Placeholder for Sentry: set VITE_SENTRY_DSN to enable.
 */

const isProd = import.meta.env.PROD
const sentryDsn = import.meta.env.VITE_SENTRY_DSN

function captureException(error, context = {}) {
  if (sentryDsn && typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.withScope((scope) => {
      Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v))
      window.Sentry.captureException(error)
    })
  }
}

/**
 * Log an error with context. Use for API failures, ConfirmModal failures, token refresh failures.
 * In development can optionally log to console; in production only to Sentry if configured.
 */
export function logError(error, context = {}) {
  const safeContext = { ...context }
  if (safeContext.token !== undefined) delete safeContext.token
  if (safeContext.headers?.Authorization) safeContext.headers = { ...safeContext.headers, Authorization: '[REDACTED]' }

  if (!isProd && typeof window !== 'undefined') {
    try {
      const msg = error?.message || String(error)
      const errObj = error?.response?.data || error
      if (window.__LOG_ERROR__) window.__LOG_ERROR__(msg, errObj, safeContext)
    } catch (_) {
      // no-op
    }
  }

  captureException(error, safeContext)
}

/**
 * Initialize Sentry if DSN is set and Sentry is loaded. Call once at app boot.
 * To enable: add @sentry/react, set VITE_SENTRY_DSN, and call Sentry.init in your app.
 */
export function initObservability() {
  if (!sentryDsn || typeof window === 'undefined') return
  if (typeof window.Sentry !== 'undefined') {
    try {
      window.Sentry.init({
        dsn: sentryDsn,
        environment: import.meta.env.MODE,
      })
    } catch (_) {}
  }
}
