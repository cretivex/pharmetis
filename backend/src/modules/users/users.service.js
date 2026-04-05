import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import prisma from '../../config/database.js';
import { logger } from '../../utils/logger.js';

// Get user profile with settings
export const getUserProfileService = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      companyName: true,
      phone: true,
      country: true,
      city: true,
      avatar: true,
      profile_image: true,
      emailVerified: true,
      kycStatus: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      userSettings: true,
      supplier: {
        select: {
          id: true,
          companyName: true,
          country: true,
          city: true,
          phone: true,
          website: true
        }
      }
    }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // For vendors, prefer supplier data; for buyers, use user data
  const profile = {
    ...user,
    companyName: user.role === 'VENDOR' && user.supplier?.companyName 
      ? user.supplier.companyName 
      : user.companyName,
    phone: user.role === 'VENDOR' && user.supplier?.phone 
      ? user.supplier.phone 
      : user.phone,
    country: user.role === 'VENDOR' && user.supplier?.country 
      ? user.supplier.country 
      : user.country,
    city: user.role === 'VENDOR' && user.supplier?.city 
      ? user.supplier.city 
      : user.city
  };

  return profile;
};

// Update user profile
export const updateUserProfileService = async (userId, data) => {
  const { email, fullName, companyName, phone, country, city, kycStatus } = data;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // If email is being changed, check if it's already taken
  if (email && email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ApiError(409, 'Email already in use');
    }
  }

  // Update user fields if provided (empty strings clear the field)
  const updateData = {};
  if (email !== undefined && email !== '') updateData.email = email;
  if (fullName !== undefined) updateData.fullName = fullName || null;
  if (companyName !== undefined) updateData.companyName = companyName || null;
  if (phone !== undefined) updateData.phone = phone || null;
  if (country !== undefined) updateData.country = country || null;
  if (city !== undefined) updateData.city = city || null;
  if (kycStatus !== undefined) updateData.kycStatus = kycStatus || null;
  if (data.avatar !== undefined) updateData.avatar = data.avatar || null;
  if (data.profile_image !== undefined) {
    updateData.profile_image = data.profile_image || null;
    if (data.avatar === undefined) {
      updateData.avatar = data.profile_image || null;
    }
  } else if (data.avatar !== undefined) {
    updateData.profile_image = data.avatar || null;
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  // If user is a vendor, also update supplier info (for business profile)
  if (user.role === 'VENDOR') {
    const supplier = await prisma.supplier.findUnique({
      where: { userId }
    });

    if (supplier) {
      const supplierUpdate = {};
      if (companyName !== undefined) supplierUpdate.companyName = companyName || null;
      if (phone !== undefined) supplierUpdate.phone = phone || null;
      if (country !== undefined) supplierUpdate.country = country || null;
      if (city !== undefined) supplierUpdate.city = city || null;

      if (Object.keys(supplierUpdate).length > 0) {
        await prisma.supplier.update({
          where: { id: supplier.id },
          data: supplierUpdate
        });
      }
    }
  }

  return await getUserProfileService(userId);
};

// Change password
export const changePasswordService = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  logger.info(`Password changed for user: ${user.email}`);

  return { message: 'Password changed successfully' };
};

/** Set password without current password (e.g. account created via OTP with random password). */
export const setPasswordService = async (userId, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword.trim(), env.BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  logger.info(`Password set for user: ${user.email}`);

  return { message: 'Password set successfully. You can now log in with your email and this password.' };
};

// Get user settings
export const getUserSettingsService = async (userId) => {
  let settings = await prisma.userSettings.findUnique({
    where: { userId }
  });

  // Create default settings if they don't exist
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId,
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        notifications: {
          email: true,
          rfqResponses: true,
          orderUpdates: true,
          marketing: false
        },
        preferences: {
          theme: 'light'
        }
      }
    });
  }

  return settings;
};

// Update user settings
export const updateUserSettingsService = async (userId, data) => {
  const { language, currency, timezone, notifications, preferences } = data;

  const updateData = {};
  if (language) updateData.language = language;
  if (currency) updateData.currency = currency;
  if (timezone) updateData.timezone = timezone;
  if (notifications) updateData.notifications = notifications;
  if (preferences) updateData.preferences = preferences;

  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: updateData,
    create: {
      userId,
      language: language || 'en',
      currency: currency || 'USD',
      timezone: timezone || 'UTC',
      notifications: notifications || {
        email: true,
        rfqResponses: true,
        orderUpdates: true,
        marketing: false
      },
      preferences: preferences || {
        theme: 'light'
      }
    }
  });

  return settings;
};
