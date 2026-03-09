import {
  getAddressesService,
  getAddressService,
  createAddressService,
  updateAddressService,
  deleteAddressService,
  setDefaultAddressService
} from './addresses.service.js';
import { logger } from '../../utils/logger.js';

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await getAddressesService(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Addresses retrieved successfully',
      data: addresses
    });
  } catch (error) {
    logger.error('Get addresses controller error:', error);
    next(error);
  }
};

export const getAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await getAddressService(id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Address retrieved successfully',
      data: address
    });
  } catch (error) {
    logger.error('Get address controller error:', error);
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const address = await createAddressService(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: address
    });
  } catch (error) {
    logger.error('Create address controller error:', error);
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await updateAddressService(id, req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    logger.error('Update address controller error:', error);
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteAddressService(id, req.user.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    logger.error('Delete address controller error:', error);
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await setDefaultAddressService(id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: address
    });
  } catch (error) {
    logger.error('Set default address controller error:', error);
    next(error);
  }
};
