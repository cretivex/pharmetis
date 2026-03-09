import {
  getUserProfileService,
  updateUserProfileService,
  changePasswordService,
  setPasswordService,
  getUserSettingsService,
  updateUserSettingsService
} from './users.service.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const result = await getUserProfileService(req.user.id);
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const result = await updateUserProfileService(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await changePasswordService(req.user.id, currentPassword, newPassword);
    res.status(200).json({
      success: true,
      message: result.message,
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const setPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const result = await setPasswordService(req.user.id, newPassword);
    res.status(200).json({
      success: true,
      message: result.message,
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSettings = async (req, res, next) => {
  try {
    const result = await getUserSettingsService(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Settings retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserSettings = async (req, res, next) => {
  try {
    const result = await updateUserSettingsService(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
