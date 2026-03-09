/**
 * Central error reporting. Use instead of console.error in production.
 * Delegates to observability.logError and optional Sentry.
 */
import { logError } from '@/lib/observability';

/**
 * Report an error with context. Use in API interceptors, ConfirmModal, Dashboard, AuditLog fetch.
 * @param {Error} error
 * @param {{ context?: string, [key: string]: unknown }} context
 */
export function reportError(error, context = {}) {
  logError(error, context);
}
