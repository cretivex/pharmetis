import prisma from '../../config/database.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Create an audit log entry (enterprise schema).
 * Called by utils/auditLogger.logAdminAction.
 */
export async function createAuditLog({
  userId,
  userEmail = null,
  userRole,
  action,
  resourceType,
  resourceId = null,
  oldValue = null,
  newValue = null,
  ipAddress = null,
  userAgent = null,
}) {
  await prisma.auditLog.create({
    data: {
      userId: String(userId),
      userEmail: userEmail != null ? String(userEmail) : null,
      userRole: String(userRole),
      action: String(action),
      resourceType: String(resourceType),
      resourceId: resourceId != null ? String(resourceId) : null,
      oldValue: oldValue != null ? oldValue : undefined,
      newValue: newValue != null ? newValue : undefined,
      ipAddress: ipAddress != null ? String(ipAddress) : null,
      userAgent: userAgent != null ? String(userAgent) : null,
    },
  });
}

/**
 * Get audit logs with filters and pagination.
 * Returns { data: logs[], pagination: { page, limit, total, totalPages } }
 */
export async function getAuditLogs(filters = {}) {
  const page = Math.max(1, parseInt(filters.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(filters.limit, 10) || DEFAULT_LIMIT));
  const user = filters.user?.trim();
  const action = filters.action?.trim();
  const resource = filters.resource?.trim();
  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;

  const where = {};

  if (user) {
    where.OR = [
      { userEmail: { contains: user, mode: 'insensitive' } },
      { userId: { contains: user, mode: 'insensitive' } },
    ];
  }
  if (action) where.action = action;
  if (resource) where.resourceType = resource;
  if (dateFrom) where.createdAt = { ...where.createdAt, gte: dateFrom };
  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    where.createdAt = { ...where.createdAt, lte: end };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get distinct action and resourceType for filter dropdowns.
 */
export async function getAuditLogMeta() {
  const [actions, resources] = await Promise.all([
    prisma.auditLog.findMany({ select: { action: true }, distinct: ['action'], orderBy: { action: 'asc' } }),
    prisma.auditLog.findMany({ select: { resourceType: true }, distinct: ['resourceType'], orderBy: { resourceType: 'asc' } }),
  ]);
  return {
    actions: actions.map((a) => a.action).filter(Boolean),
    resources: resources.map((r) => r.resourceType).filter(Boolean),
  };
}
