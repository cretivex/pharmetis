import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

// Get all addresses for user
export const getAddressesService = async (userId) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return addresses;
  } catch (error) {
    logger.error('Get addresses service error:', error);
    throw error;
  }
};

// Get single address
export const getAddressService = async (addressId, userId) => {
  try {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId
      }
    });

    if (!address) {
      throw new ApiError(404, 'Address not found');
    }

    return address;
  } catch (error) {
    logger.error('Get address service error:', error);
    throw error;
  }
};

// Create address
export const createAddressService = async (userId, data) => {
  try {
    const { label, fullName, companyName, phone, email, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = data;

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label: label || null,
        fullName,
        companyName: companyName || null,
        phone,
        email: email || null,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault || false
      }
    });

    logger.info(`Address created for user: ${userId}`);
    return address;
  } catch (error) {
    logger.error('Create address service error:', error);
    throw error;
  }
};

// Update address
export const updateAddressService = async (addressId, userId, data) => {
  try {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId
      }
    });

    if (!address) {
      throw new ApiError(404, 'Address not found');
    }

    const { label, fullName, companyName, phone, email, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = data;

    // If setting as default, unset other defaults
    if (isDefault && !address.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: {
        label: label !== undefined ? label : undefined,
        fullName: fullName !== undefined ? fullName : undefined,
        companyName: companyName !== undefined ? companyName : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        addressLine1: addressLine1 !== undefined ? addressLine1 : undefined,
        addressLine2: addressLine2 !== undefined ? addressLine2 : undefined,
        city: city !== undefined ? city : undefined,
        state: state !== undefined ? state : undefined,
        postalCode: postalCode !== undefined ? postalCode : undefined,
        country: country !== undefined ? country : undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined
      }
    });

    logger.info(`Address updated: ${addressId}`);
    return updated;
  } catch (error) {
    logger.error('Update address service error:', error);
    throw error;
  }
};

// Delete address
export const deleteAddressService = async (addressId, userId) => {
  try {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId
      }
    });

    if (!address) {
      throw new ApiError(404, 'Address not found');
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    logger.info(`Address deleted: ${addressId}`);
    return { success: true, message: 'Address deleted successfully' };
  } catch (error) {
    logger.error('Delete address service error:', error);
    throw error;
  }
};

// Set default address
export const setDefaultAddressService = async (addressId, userId) => {
  try {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId
      }
    });

    if (!address) {
      throw new ApiError(404, 'Address not found');
    }

    // Unset all other defaults
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });

    // Set this as default
    const updated = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true }
    });

    logger.info(`Default address set: ${addressId}`);
    return updated;
  } catch (error) {
    logger.error('Set default address service error:', error);
    throw error;
  }
};
