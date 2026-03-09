import prisma from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Check database connectivity and that critical auth tables exist and are queryable.
 * GET /api/health/db
 */
export const checkDb = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.user.findFirst({ select: { id: true } });
    await prisma.oTP.findFirst({ select: { id: true } });
    await prisma.refreshToken.findFirst({ select: { id: true } });

    res.status(200).json({
      success: true,
      message: 'Database OK',
      tables: ['users', 'otps', 'refresh_tokens'],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Health DB check failed:', error?.message || error);
    res.status(503).json({
      success: false,
      message: 'Database check failed',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      timestamp: new Date().toISOString(),
    });
  }
};
