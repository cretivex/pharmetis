import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import prisma from '../../config/database.js';
import { logger } from '../../utils/logger.js';

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
    logger.warn(`Registration attempt with existing email: ${normalizedEmail} (User ID: ${existingUser.id})`);
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

  logger.info(`User registered: ${email} (${role})`);

  return {
    user,
    accessToken,
    refreshToken
  };
};

export const login = async (email, password) => {
  const normalizedEmail = (email && typeof email === 'string') ? email.toLowerCase().trim() : '';
  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      deletedAt: null
    }
  });

  if (!user) {
    logger.warn(`Login attempt failed: ${normalizedEmail} - User not found`);
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.password || typeof password !== 'string' || !password.trim()) {
    logger.warn(`Login attempt failed: ${normalizedEmail} - Missing password`);
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password.trim(), user.password);

  if (!isPasswordValid) {
    logger.warn(`Login attempt failed: ${normalizedEmail} - Invalid password`);
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = await generateTokens(user.id);

  logger.info(`User logged in: ${normalizedEmail} (${user.role})`);

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

    logger.info(`Token refreshed: ${tokenRecord.user.email}`);

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
  const accessToken = jwt.sign(
    { userId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId },
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
