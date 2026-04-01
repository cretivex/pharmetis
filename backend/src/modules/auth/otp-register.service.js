import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { sendOTPEmail } from '../../services/email.service.js';
import { env } from '../../config/env.js';
import { generateTokens } from './auth.service.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a secure random password for OTP-based registration
const generateSecurePassword = () => {
  return crypto.randomBytes(32).toString('hex');
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

// Normalize email for consistent lookup and storage (matches auth.service login)
const normalizeEmail = (e) => (e && typeof e === 'string' ? e.toLowerCase().trim() : '');

// Send registration OTP (normalize email so verify + login stay consistent)
export const sendRegistrationOTPService = async (email, fullName = null, companyName = null) => {
  try {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new ApiError(400, 'Email is required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
        deletedAt: null
      }
    });

    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists. Please login instead.');
    }

    // Clean up expired OTPs (use normalized so we match stored OTPs)
    await cleanupExpiredOTPs(normalizedEmail);

    // Check for recent OTP requests (rate limiting) - more lenient in development
    const rateLimitWindow = env.IS_DEVELOPMENT ? 30000 : 60000; // 30 seconds in dev, 1 minute in prod
    const recentOTP = await prisma.oTP.findFirst({
      where: {
        email: normalizedEmail,
        createdAt: {
          gte: new Date(Date.now() - rateLimitWindow)
        },
        used: false,
        userId: null // Only check registration OTPs
      }
    });

    if (recentOTP) {
      const waitTime = Math.ceil((rateLimitWindow - (Date.now() - recentOTP.createdAt.getTime())) / 1000);
      throw new ApiError(429, `Please wait ${waitTime} seconds before requesting another OTP. Check your email.`);
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + env.OTP_EXPIRY_MINUTES);

    // Save OTP to database with normalized email so verify finds it
    await prisma.oTP.create({
      data: {
        email: normalizedEmail,
        code: otpCode,
        expiresAt,
        userId: null
      }
    });

    // Send OTP via email (use original email for display, OTP stored normalized)
    await sendOTPEmail(normalizedEmail, otpCode, true); // true = registration

    logger.info(`Registration OTP sent to ${normalizedEmail}`);

    return {
      success: true,
      message: 'OTP sent successfully. Please check your email to complete registration.',
      expiresAt: expiresAt.toISOString()
    };
  } catch (error) {
    logger.error('Send registration OTP service error:', error);
    throw error;
  }
};

// Verify registration OTP and create user
export const verifyRegistrationOTPService = async (email, otpCode, fullName = null, companyName = null, passwordFromRequest = null) => {
  try {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new ApiError(400, 'Email is required');
    }

    // Find valid OTP (stored with normalized email from send)
    const otp = await prisma.oTP.findFirst({
      where: {
        email: normalizedEmail,
        code: otpCode,
        used: false,
        expiresAt: {
          gt: new Date()
        },
        userId: null // Registration OTPs have null userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otp) {
      logger.warn(`Invalid registration OTP attempt for ${email}`);
      throw new ApiError(401, 'Invalid or expired OTP code');
    }

    // Check if user already exists (double check, case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
        deletedAt: null
      }
    });

    if (existingUser) {
      await prisma.oTP.update({
        where: { id: otp.id },
        data: { used: true }
      });
      throw new ApiError(409, 'User with this email already exists. Please login instead.');
    }

    // Use provided password if valid (min 8 chars), otherwise random (for OTP-only login)
    const passwordToUse =
      passwordFromRequest && typeof passwordFromRequest === 'string' && passwordFromRequest.trim().length >= 8
        ? passwordFromRequest.trim()
        : generateSecurePassword();
    const hashedPassword = await bcrypt.hash(passwordToUse, env.BCRYPT_SALT_ROUNDS);

    // Create user with normalized email so password login (which normalizes email) finds them
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: 'BUYER',
        fullName: fullName || null,
        companyName: companyName || null
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        companyName: true,
        createdAt: true
      }
    });

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { used: true, userId: user.id }
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    logger.info(`User registered via OTP: ${normalizedEmail} (BUYER)`);

    // Clean up expired OTPs for this email (use stored OTP email for delete)
    await cleanupExpiredOTPs(otp.email);

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
    logger.error('Verify registration OTP service error:', error);
    throw error;
  }
};

// Resend registration OTP
export const resendRegistrationOTPService = async (email) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null
      }
    });

    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists. Please login instead.');
    }

    // Clean up expired OTPs
    await cleanupExpiredOTPs(email);

    // Check for recent OTP requests
    const recentOTP = await prisma.oTP.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - 30000) // Last 30 seconds
        },
        used: false,
        userId: null
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
        userId: null
      }
    });

    // Send OTP via email
    await sendOTPEmail(email, otpCode, true); // true = registration

    logger.info(`Registration OTP resent to ${email}`);

    return {
      success: true,
      message: 'OTP resent successfully. Please check your email.',
      expiresAt: expiresAt.toISOString()
    };
  } catch (error) {
    logger.error('Resend registration OTP service error:', error);
    throw error;
  }
};
