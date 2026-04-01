import { getAnalyticsService } from './analytics.service.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

export const getAnalytics = async (req, res, next) => {
  try {
    logger.debug('Analytics request - User:', req.user?.email, 'Role:', req.user?.role);
    
    const result = await getAnalyticsService();
    
    res.status(200).json({
      success: true,
      message: 'Analytics data retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Analytics controller error:', error);
    
    if (error instanceof ApiError) {
      return next(error);
    }
    
    next(new ApiError(500, 'Failed to retrieve analytics data'));
  }
};
