import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { sendOTPEmail } from '../../services/email.service.js';
import { env } from '../../config/env.js';
import { generateTokens } from './auth.service.js';

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Clean up expired OTPs
const cleanupExpiredOTPs = async (email) => {
  await prisma.oTP.deleteMany({
    where: {
      email,
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true }
      ]
    }
  });
};

// Send OTP to user's email (for login or registration)
export const sendOTPService = async (email, isRegistration = false) => {
  try {
    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null
      }
    });

    // For login: user must exist
    if (!isRegistration && !user) {
      logger.warn(`OTP request for non-existent user: ${email}`);
      throw new ApiError(404, 'User not found with this email');
    }

    // For registration: user must NOT exist
    if (isRegistration && user) {
      logger.warn(`Registration attempt for existing user: ${email}`);
      throw new ApiError(409, 'User with this email already exists. Please login instead.');
    }

    // Clean up expired OTPs
    await cleanupExpiredOTPs(email);

    // Check for recent OTP requests (rate limiting)
    const recentOTP = await prisma.oTP.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - 60000) // Last 1 minute
        },
        used: false
      }
    });

    if (recentOTP) {
      throw new ApiError(429, 'Please wait before requesting another OTP. Check your email.');
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + env.OTP_EXPIRY_MINUTES);

    // Save OTP to database
    const otp = await prisma.oTP.create({
      data: {
        email,
        code: otpCode,
        expiresAt,
        userId: user?.id || null // null for registration
      }
    });

    // Send OTP via email
    await sendOTPEmail(email, otpCode);

    logger.info(`OTP sent to ${email}`);

    return {
      success: true,
      message: 'OTP sent successfully. Please check your email.',
      expiresAt: expiresAt.toISOString()
    };
  } catch (error) {
    logger.error('Send OTP service error:', error);
    throw error;
  }
};

// Verify OTP and login user
export const verifyOTPService = async (email, otpCode) => {
  try {
    // Find valid OTP (only for login - must have userId)
    const otp = await prisma.oTP.findFirst({
      where: {
        email,
        code: otpCode,
        used: false,
        expiresAt: {
          gt: new Date()
        },
        userId: {
          not: null // Only login OTPs have userId
        }
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otp) {
      logger.warn(`Invalid OTP attempt for ${email}`);
      throw new ApiError(401, 'Invalid or expired OTP code');
    }

    // Check if user exists and is not deleted
    if (!otp.user || otp.user.deletedAt) {
      throw new ApiError(404, 'User not found');
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { used: true }
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(otp.user.id);

    logger.info(`User logged in via OTP: ${email} (${otp.user.role})`);

    // Clean up expired OTPs for this email
    await cleanupExpiredOTPs(email);

    return {
      user: {
        id: otp.user.id,
        email: otp.user.email,
        role: otp.user.role,
        createdAt: otp.user.createdAt
      },
      token: accessToken,
      accessToken,
      refreshToken
    };
  } catch (error) {
    logger.error('Verify OTP service error:', error);
    throw error;
  }
};

// Resend OTP
export const resendOTPService = async (email) => {
  try {
    // Clean up expired OTPs
    await cleanupExpiredOTPs(email);

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null
      }
    });

    if (!user) {
      throw new ApiError(404, 'User not found with this email');
    }

    // Check for recent OTP requests
    const recentOTP = await prisma.oTP.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - 30000) // Last 30 seconds
        },
        used: false
      }
    });

    if (recentOTP) {
      throw new ApiError(429, 'Please wait 30 seconds before requesting another OTP.');
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + env.OTP_EXPIRY_MINUTES);

    // Save OTP to database
    await prisma.oTP.create({
      data: {
        email,
        code: otpCode,
        expiresAt,
        userId: user.id
      }
    });

    // Send OTP via email
    await sendOTPEmail(email, otpCode);

    logger.info(`OTP resent to ${email}`);

    return {
      success: true,
      message: 'OTP resent successfully. Please check your email.',
      expiresAt: expiresAt.toISOString()
    };
  } catch (error) {
    logger.error('Resend OTP service error:', error);
    throw error;
  }
};
