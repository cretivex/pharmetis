import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import prisma from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { queueEmailSend, sendPasswordResetLinkEmail } from '../../services/email.service.js';

export const register = async (email, password, role = 'BUYER') => {
  // Normalize email: lowercase and trim whitespace
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check for existing user (excluding soft-deleted users)
  const existingUser = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      deletedAt: null
    }
  });

  if (existingUser) {
    logger.warn('registration_conflict', { userId: existingUser.id });
    throw new ApiError(409, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail, // Use normalized email
      password: hashedPassword,
      role
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  const { accessToken, refreshToken } = await generateTokens(user.id);

  logger.info('registration_success', { role });

  return {
    user,
    accessToken,
    refreshToken
  };
};

export const login = async (email, password, expectedRole) => {
  const normalizedEmail = (email && typeof email === 'string') ? email.toLowerCase().trim() : '';
  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      deletedAt: null
    }
  });

  if (!user) {
    logger.warn('login_failed_user_not_found');
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.password || typeof password !== 'string' || !password.trim()) {
    logger.warn('login_failed_missing_password');
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password.trim(), user.password);

  if (!isPasswordValid) {
    logger.warn('login_failed_invalid_password');
    throw new ApiError(401, 'Invalid email or password');
  }

  if (expectedRole && user.role !== expectedRole) {
    const portalHint =
      expectedRole === 'VENDOR'
        ? ' Use a supplier (vendor) account, or the correct portal for your role.'
        : '';
    throw new ApiError(
      403,
      `This account cannot sign in here. Required role: ${expectedRole}.${portalHint}`
    );
  }

  const { accessToken, refreshToken } = await generateTokens(user.id);

  logger.info('login_success', { userId: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    token: accessToken,
    accessToken,
    refreshToken
  };
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    if (!tokenRecord.user || tokenRecord.user.deletedAt) {
      throw new ApiError(401, 'User not found');
    }

    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true, revokedAt: new Date() }
    });

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(tokenRecord.user.id);

    logger.info('token_refreshed', { userId: tokenRecord.user.id });

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
    throw error;
  }
};

export const generateTokens = async (userId) => {
  const accessJti = crypto.randomUUID();
  const refreshJti = crypto.randomUUID();
  const accessToken = jwt.sign(
    { userId, jti: accessJti },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, jti: refreshJti },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt
    }
  });

  return { accessToken, refreshToken };
};

/** Revoke a refresh token in the database (e.g. on logout). */
export const revokeRefreshTokenByValue = async (refreshToken) => {
  if (!refreshToken || typeof refreshToken !== 'string') return;
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken }
  });
  if (tokenRecord && !tokenRecord.revoked) {
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true, revokedAt: new Date() }
    });
    logger.info('Refresh token revoked (logout)');
  }
};

export const revokeRefreshTokensByUserId = async (userId) => {
  if (!userId) return;
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revoked: false
    },
    data: {
      revoked: true,
      revokedAt: new Date()
    }
  });
};

const buildResetLinkForRole = (role, token) => {
  const encodedToken = encodeURIComponent(token);
  if (role === 'VENDOR') {
    return `${env.FRONTEND_SUPPLIER_URL}/supplier/reset-password?token=${encodedToken}`;
  }
  if (['ADMIN', 'SUPER_ADMIN', 'SUPPORT_ADMIN', 'READ_ONLY_ADMIN'].includes(role)) {
    return `${env.FRONTEND_ADMIN_URL}/reset-password?token=${encodedToken}`;
  }
  return `${env.FRONTEND_USER_URL}/reset-password?token=${encodedToken}`;
};

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const requestPasswordReset = async (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const genericMessage = 'If this email exists, a reset link has been sent.';
  if (!normalizedEmail) return { message: genericMessage };

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      deletedAt: null
    },
    select: {
      id: true,
      email: true,
      role: true
    }
  });

  if (!user) {
    return { message: genericMessage };
  }

  const supplier = await prisma.supplier.findFirst({
    where: {
      userId: user.id,
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashResetToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt
    }
  });

  if (supplier) {
    await prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt
      }
    });
  }

  const resetLink = buildResetLinkForRole(user.role, token);
  queueEmailSend(
    () => sendPasswordResetLinkEmail(user.email, resetLink),
    {
      event: 'auth.forgot_password',
      userId: user.id,
      to: user.email
    }
  );

  return { message: genericMessage };
};

export const resetPasswordWithToken = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new ApiError(400, 'Token and new password are required');
  }

  const hashedToken = hashResetToken(token);
  const now = new Date();

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { gt: now },
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    await tx.supplier.updateMany({
      where: { userId: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
        resetOtp: null,
        resetOtpExpires: null
      }
    });

    await tx.refreshToken.updateMany({
      where: {
        userId: user.id,
        revoked: false
      },
      data: {
        revoked: true,
        revokedAt: new Date()
      }
    });
  });

  logger.info('password_reset_success', { userId: user.id });
  return { message: 'Password reset successful' };
};
