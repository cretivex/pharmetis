import { getSystemSettingsService, updateSystemSettingsService } from './system-settings.service.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

export const getSystemSettings = async (req, res, next) => {
  try {
    logger.debug('Get system settings request - User:', req.user?.email, 'Role:', req.user?.role);
    
    const result = await getSystemSettingsService();
    
    res.status(200).json({
      success: true,
      message: 'System settings retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Get system settings controller error:', error);
    
    if (error instanceof ApiError) {
      return next(error);
    }
    
    next(new ApiError(500, 'Failed to retrieve system settings'));
  }
};

export const updateSystemSettings = async (req, res, next) => {
  try {
    logger.debug('Update system settings request - User:', req.user?.email, 'Role:', req.user?.role);
    
    const result = await updateSystemSettingsService(req.user.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      data: result
    });
  } catch (error) {
    logger.error('Update system settings controller error:', error);
    
    if (error instanceof ApiError) {
      return next(error);
    }
    
    next(new ApiError(500, 'Failed to update system settings'));
  }
};
