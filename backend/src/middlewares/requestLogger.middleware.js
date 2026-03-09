import { logger } from '../utils/logger.js';
import { recordLatency, recordError } from '../services/anomaly.service.js';
import { env } from '../config/env.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  logger.info(`[${req.method}] ${req.originalUrl}`);
  if (env.IS_DEVELOPMENT) {
    logger.debug('Headers:', {
      authorization: req.headers.authorization ? 'Bearer ***' : 'none',
      'content-type': req.headers['content-type']
    });
    logger.debug('Query:', req.query);
    logger.debug('Body:', req.body);
  }

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`[${req.method}] ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    recordLatency(duration);
    if (res.statusCode >= 500) recordError();
  });

  next();
};
