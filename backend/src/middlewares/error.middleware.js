import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { Prisma } from '@prisma/client';
import { recordAuthFailure } from '../services/anomaly.service.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Duplicate key error (unique constraint violation)
      const field = err.meta?.target?.[0] || 'field';
      if (field === 'email') {
        error = new ApiError(409, 'An account with this email already exists. Please login instead.');
      } else {
        error = new ApiError(409, `${field} already exists`);
      }
    } else if (err.code === 'P2025') {
      error = new ApiError(404, 'Record not found');
    } else {
      logger.error('Prisma error:', { code: err.code, message: err.message });
      const detail = env.IS_DEVELOPMENT ? `${err.code}: ${err.message}` : 'Database operation failed';
      error = new ApiError(400, detail);
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    logger.error('Prisma validation error:', err.message);
    const detail = env.IS_DEVELOPMENT ? err.message : 'Invalid data provided. Please check all required fields.';
    error = new ApiError(400, detail);
  } 
  // Handle Joi validation errors (from validate middleware)
  else if (err.isJoi || err.name === 'ValidationError') {
    const message = err.details?.[0]?.message || err.message || 'Validation error';
    error = new ApiError(400, message);
  }
  // Handle ApiError instances
  else if (error instanceof ApiError) {
    // Already an ApiError, use as is
  }
  // Handle generic errors
  else {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const { statusCode, message } = error;

  if (statusCode === 401) recordAuthFailure();

  logger.error(`[${req.method}] ${req.path} - ${statusCode} - ${message}`);

  if (env.IS_DEVELOPMENT && error.stack) {
    logger.debug('Stack trace:', error.stack);
  }

  // Ensure response hasn't been sent
  if (!res.headersSent) {
    const body = { success: false, message };
    if (env.IS_DEVELOPMENT) {
      body.stack = error.stack;
      if (err?.code) body.errorCode = err.code;
    }
    res.status(statusCode).json(body);
  } else {
    // If headers already sent, log error
    logger.error('Response already sent, cannot send error response');
  }
};

export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};
