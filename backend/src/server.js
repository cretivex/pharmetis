import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import app from './app.js';

let server;

const startServer = async () => {
  try {
    await connectDatabase();
    
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
      logger.info(`📦 Environment: ${env.NODE_ENV}`);
      logger.info(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
      logger.info(`🔒 Production Mode: ${env.IS_PRODUCTION}`);
      logger.info(`📊 Log Level: ${env.LOG_LEVEL}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      await disconnectDatabase();
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections (don't crash server)
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', {
    message: err?.message || 'Unknown error',
    stack: err?.stack,
    code: err?.code,
    name: err?.name
  });
  
  // In production, log but don't crash
  // In development, still log but allow server to continue
  if (env.IS_PRODUCTION) {
    // In production, we might want to restart gracefully
    // but for now, just log and continue
    logger.warn('Server continuing despite unhandled rejection');
  }
});

// Handle uncaught exceptions (critical - should restart)
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception (CRITICAL):', {
    message: err?.message || 'Unknown error',
    stack: err?.stack,
    code: err?.code,
    name: err?.name
  });
  
  // Uncaught exceptions are more serious - graceful shutdown
  gracefulShutdown('uncaughtException');
});

startServer();
