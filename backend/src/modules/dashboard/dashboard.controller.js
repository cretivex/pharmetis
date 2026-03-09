import { getDashboardStatsService, getDashboardCountsService, getDashboardMonitoringService } from './dashboard.service.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    logger.debug('Dashboard stats request - User:', req.user?.email, 'Role:', req.user?.role);
    
    const result = await getDashboardStatsService();
    
    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Dashboard controller error:', error);
    
    if (error instanceof ApiError) {
      return next(error);
    }
    
    next(new ApiError(500, 'Failed to retrieve dashboard stats'));
  }
};

export const getDashboardMonitoring = async (req, res, next) => {
  try {
    const result = await getDashboardMonitoringService();
    res.status(200).json({
      success: true,
      message: 'Dashboard monitoring retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Dashboard monitoring controller error:', error);
    if (error instanceof ApiError) return next(error);
    next(new ApiError(500, 'Failed to retrieve dashboard monitoring'));
  }
};

export const getDashboardCounts = async (req, res, next) => {
  try {
    logger.debug('Dashboard counts request - User:', req.user?.email, 'Role:', req.user?.role);
    
    const result = await getDashboardCountsService();
    
    res.status(200).json({
      success: true,
      message: 'Dashboard counts retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Dashboard counts controller error:', error);
    
    if (error instanceof ApiError) {
      return next(error);
    }
    
    next(new ApiError(500, 'Failed to retrieve dashboard counts'));
  }
};
