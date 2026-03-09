import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

// Get security settings
export const getSecuritySettingsService = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        otpLoginEnabled: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get active sessions (refresh tokens)
    const activeSessions = await prisma.refreshToken.findMany({
      where: {
        userId,
        revoked: false,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      email: user.email,
      emailVerified: user.emailVerified,
      otpLoginEnabled: user.otpLoginEnabled,
      accountCreatedAt: user.createdAt,
      activeSessions: activeSessions.map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        device: 'Unknown', // Could be enhanced with device tracking
        location: 'Unknown' // Could be enhanced with IP geolocation
      }))
    };
  } catch (error) {
    logger.error('Get security settings service error:', error);
    throw error;
  }
};

// Update OTP login preference
export const updateOTPLoginPreferenceService = async (userId, enabled) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { otpLoginEnabled: enabled }
    });

    logger.info(`OTP login ${enabled ? 'enabled' : 'disabled'} for user: ${userId}`);
    return { otpLoginEnabled: enabled };
  } catch (error) {
    logger.error('Update OTP login preference service error:', error);
    throw error;
  }
};

// Logout all devices (revoke all refresh tokens)
export const logoutAllDevicesService = async (userId) => {
  try {
    const result = await prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false
      },
      data: {
        revoked: true,
        revokedAt: new Date()
      }
    });

    logger.info(`All devices logged out for user: ${userId}. Tokens revoked: ${result.count}`);
    return { success: true, message: 'All devices logged out successfully', revokedCount: result.count };
  } catch (error) {
    logger.error('Logout all devices service error:', error);
    throw error;
  }
};

// Revoke specific session
export const revokeSessionService = async (sessionId, userId) => {
  try {
    const token = await prisma.refreshToken.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!token) {
      throw new ApiError(404, 'Session not found');
    }

    await prisma.refreshToken.update({
      where: { id: sessionId },
      data: {
        revoked: true,
        revokedAt: new Date()
      }
    });

    logger.info(`Session revoked: ${sessionId}`);
    return { success: true, message: 'Session revoked successfully' };
  } catch (error) {
    logger.error('Revoke session service error:', error);
    throw error;
  }
};
