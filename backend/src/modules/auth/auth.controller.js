import {
  register,
  login,
  refreshAccessToken,
  requestPasswordReset,
  resetPasswordWithToken,
  revokeRefreshTokenByValue
} from './auth.service.js';
import { setAuthCookies, clearAuthCookies } from '../../utils/authCookies.js';

export const registerController = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const result = await register(email, password, role);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password, expectedRole } = req.body;

    const result = await login(email, password, expectedRole);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.accessToken,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await refreshAccessToken(refreshToken);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    await revokeRefreshTokenByValue(refreshToken);
    clearAuthCookies(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMeController = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation does not match'
      });
    }
    const result = await resetPasswordWithToken(token, newPassword);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};
