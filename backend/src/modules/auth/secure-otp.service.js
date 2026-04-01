import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { sendOTPEmail } from '../../services/smtp.service.js';
import { env } from '../../config/env.js';
import { generateTokens } from './auth.service.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Generate 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP before storing
const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

// Compare OTP
const compareOTP = async (otp, hashedOTP) => {
  return await bcrypt.compare(otp, hashedOTP);
};

// Check rate limit for OTP requests
const checkRateLimit = async (userId) => {
  const tenMinutesAgo = new Date(Date.now() - env.OTP_RATE_LIMIT_WINDOW);
  
  const recentRequests = await prisma.userOTP.count({
    where: {
      userId,
      createdAt: {
        gte: tenMinutesAgo
      }
    }
  });

  if (recentRequests >= env.OTP_RATE_LIMIT_COUNT) {
    throw new ApiError(429, 'Too many OTP requests. Please wait before requesting another.');
  }
};

// Request OTP
export const requestOTPService = async (email) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'Invalid email format');
    }

    // Check if user exists (don't reveal if email exists for security)
    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null
      }
    });

    if (!user) {
      // Don't reveal that email doesn't exist - return success anyway
      logger.warn(`OTP request for non-existent email: ${email}`);
      // Return success to prevent email enumeration
      return {
        success: true,
        message: 'If the email exists, an OTP has been sent.'
      };
    }

    // Check rate limit
    await checkRateLimit(user.id);

    // Generate OTP
    const otpCode = generateOTP();
    const hashedOTP = await hashOTP(otpCode);
    const expiresAt = new Date();
    const expiryMinutes = env.OTP_EXPIRY_MINUTES || 5;
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    // Clear previous OTP attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0
      }
    });

    // Store OTP in user_otps table
    await prisma.userOTP.create({
      data: {
        userId: user.id,
        otpCode: hashedOTP,
        expiresAt,
        attempts: 0
      }
    });

    // Also store in user table for quick access
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: hashedOTP,
        otpExpiresAt: expiresAt,
        otpAttempts: 0
      }
    });

    // Send OTP via email - Always send to cretivex4@gmail.com
    const recipientEmail = 'cretivex4@gmail.com';
    try {
      await sendOTPEmail(recipientEmail, otpCode);
      logger.info(`OTP sent to ${recipientEmail} (original email: ${email})`);
    } catch (emailError) {
      logger.error('Failed to send OTP email:', emailError);
      // Clear OTP if email fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode: null,
          otpExpiresAt: null
        }
      });
      throw new ApiError(500, 'Failed to send OTP. Please try again later.');
    }

    logger.info(`OTP requested for ${email}`);

    return {
      success: true,
      message: 'If the email exists, an OTP has been sent.'
    };
  } catch (error) {
    logger.error('Request OTP service error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to process OTP request');
  }
};

// Verify OTP
export const verifyOTPService = async (email, otp) => {
  try {
    // Validate input
    if (!email || !otp) {
      throw new ApiError(400, 'Email and OTP are required');
    }

    if (!/^\d{6}$/.test(otp)) {
      throw new ApiError(400, 'OTP must be 6 digits');
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null
      }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid OTP');
    }

    // For admin panel login, ensure user has ADMIN role
    // Auto-upgrade cretivex4@gmail.com to ADMIN if needed
    if (email.toLowerCase() === 'cretivex4@gmail.com' && user.role !== 'ADMIN') {
      logger.warn(`Auto-upgrading ${email} to ADMIN role for admin panel access`);
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
      user.role = 'ADMIN';
    }

    // Check if OTP exists
    if (!user.otpCode || !user.otpExpiresAt) {
      throw new ApiError(400, 'No OTP found. Please request a new one.');
    }

    // Check if OTP expired
    if (new Date() > user.otpExpiresAt) {
      // Clear expired OTP
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode: null,
          otpExpiresAt: null,
          otpAttempts: 0
        }
      });
      throw new ApiError(400, 'OTP expired. Please request a new one.');
    }

    // Check attempts
    if (user.otpAttempts >= env.OTP_MAX_ATTEMPTS) {
      // Clear OTP after max attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode: null,
          otpExpiresAt: null,
          otpAttempts: 0
        }
      });
      throw new ApiError(400, 'Too many failed attempts. Please request a new OTP.');
    }

    // Compare OTP
    const isValid = await compareOTP(otp, user.otpCode);

    if (!isValid) {
      // Increment attempts
      const newAttempts = user.otpAttempts + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpAttempts: newAttempts
        }
      });

      logger.warn(`Invalid OTP attempt for ${email}. Attempts: ${newAttempts}/${env.OTP_MAX_ATTEMPTS}`);

      if (newAttempts >= env.OTP_MAX_ATTEMPTS) {
        // Clear OTP after max attempts
        await prisma.user.update({
          where: { id: user.id },
          data: {
            otpCode: null,
            otpExpiresAt: null,
            otpAttempts: 0
          }
        });
        throw new ApiError(400, 'Too many failed attempts. Please request a new OTP.');
      }

      throw new ApiError(400, `Invalid OTP. ${env.OTP_MAX_ATTEMPTS - newAttempts} attempts remaining.`);
    }

    // OTP is valid - clear OTP and generate JWT
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0
      }
    });

    // Delete from user_otps table
    await prisma.userOTP.deleteMany({
      where: {
        userId: user.id,
        expiresAt: {
          gte: new Date(Date.now() - 600000) // Last 10 minutes
        }
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    logger.info(`User logged in via OTP: ${email} (${user.role})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        companyName: user.companyName,
        createdAt: user.createdAt
      },
      token: accessToken,
      accessToken,
      refreshToken
    };
  } catch (error) {
    logger.error('Verify OTP service error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to verify OTP');
  }
};
