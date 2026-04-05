import {
  createPaymentService,
  confirmPaymentService,
  listPaymentsForBuyerService,
} from './payments.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

export const listMyPayments = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'BUYER') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can list payments',
      });
    }
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const data = await listPaymentsForBuyerService(req.user.id, { page, limit });
    return res.status(200).json({
      success: true,
      message: 'Payments retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'BUYER') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can create payments'
      });
    }

    const { rfqId } = req.body;
    const { paymentType, amount } = req.body;

    if (!rfqId) {
      return res.status(400).json({
        success: false,
        message: 'RFQ ID is required'
      });
    }

    if (!paymentType || !['FULL', 'ADVANCE'].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment type. Must be FULL or ADVANCE'
      });
    }

    const payment = await createPaymentService(rfqId, req.user.id, {
      paymentType,
      amount
    });

    return res.status(200).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (error) {
    logger.error('Create payment error:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    });
    
    if (error instanceof ApiError) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to create payment'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

export const confirmPayment = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'BUYER') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can confirm payments'
      });
    }

    const { id } = req.params;
    const { transactionId, gateway, gatewayResponse } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const result = await confirmPaymentService(id, req.user.id, {
      transactionId,
      gateway: gateway || 'MANUAL',
      gatewayResponse: gatewayResponse || {}
    });

    return res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: result
    });
  } catch (error) {
    logger.error('Confirm payment error:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    });
    
    if (error instanceof ApiError) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to confirm payment'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm payment',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};
