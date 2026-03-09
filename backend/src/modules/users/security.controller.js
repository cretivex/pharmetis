import {
  getSecuritySettingsService,
  updateOTPLoginPreferenceService,
  logoutAllDevicesService,
  revokeSessionService
} from './security.service.js';
import { logger } from '../../utils/logger.js';

export const getSecuritySettings = async (req, res, next) => {
  try {
    const result = await getSecuritySettingsService(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Security settings retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Get security settings controller error:', error);
    next(error);
  }
};

export const updateOTPLoginPreference = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    const result = await updateOTPLoginPreferenceService(req.user.id, enabled);
    res.status(200).json({
      success: true,
      message: `OTP login ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: result
    });
  } catch (error) {
    logger.error('Update OTP login preference controller error:', error);
    next(error);
  }
};

export const logoutAllDevices = async (req, res, next) => {
  try {
    const result = await logoutAllDevicesService(req.user.id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { revokedCount: result.revokedCount }
    });
  } catch (error) {
    logger.error('Logout all devices controller error:', error);
    next(error);
  }
};

export const revokeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await revokeSessionService(id, req.user.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    logger.error('Revoke session controller error:', error);
    next(error);
  }
};
