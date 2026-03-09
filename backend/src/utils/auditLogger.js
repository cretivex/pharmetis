/**
 * Enterprise audit logger. Call from controllers after admin actions.
 * Captures ipAddress and userAgent from req when provided.
 */
import { createAuditLog } from '../modules/audit-logs/audit-logs.service.js';
import { logger } from './logger.js';

function getClientIp(req) {
  if (!req) return null;
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.ip ?? req.socket?.remoteAddress ?? null;
}

function getUserAgent(req) {
  return req?.headers?.['user-agent'] ?? null;
}

/**
 * Log an admin action to the audit log.
 * @param {Object} opts
 * @param {Object} opts.user - { id, email?, role }
 * @param {string} opts.action - e.g. SUPPLIER_APPROVE, PRODUCT_UPDATE
 * @param {string} opts.resourceType - e.g. Supplier, Product, RFQ
 * @param {string} [opts.resourceId]
 * @param {Object} [opts.oldValue] - JSON-serializable state before change
 * @param {Object} [opts.newValue] - JSON-serializable state after change
 * @param {Object} [opts.req] - Express request (for ip, user-agent)
 */
export async function logAdminAction({ user, action, resourceType, resourceId = null, oldValue = null, newValue = null, req = null }) {
  try {
    const userId = user?.id ?? user?.userId ?? '';
    const userRole = user?.role ?? 'UNKNOWN';
    const userEmail = user?.email ?? null;
    const ipAddress = req ? getClientIp(req) : null;
    const userAgent = req ? getUserAgent(req) : null;

    await createAuditLog({
      userId: String(userId),
      userEmail,
      userRole: String(userRole),
      action: String(action),
      resourceType: String(resourceType),
      resourceId: resourceId != null ? String(resourceId) : null,
      oldValue: oldValue != null ? oldValue : null,
      newValue: newValue != null ? newValue : null,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    logger.error('auditLogger: failed to write audit log', { action, resourceType, error: err?.message });
  }
}
