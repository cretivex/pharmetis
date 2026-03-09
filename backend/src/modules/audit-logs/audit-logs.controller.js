import { getAuditLogs, getAuditLogMeta } from './audit-logs.service.js';

export async function listAuditLogs(req, res, next) {
  try {
    const { page, limit, user, action, resource, dateFrom, dateTo } = req.query;
    const result = await getAuditLogs({
      page,
      limit,
      user,
      action,
      resource,
      dateFrom,
      dateTo,
    });
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMeta(req, res, next) {
  try {
    const meta = await getAuditLogMeta();
    res.status(200).json({
      success: true,
      data: meta,
    });
  } catch (error) {
    next(error);
  }
}
