import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { env } from './env.js';

const prisma = new PrismaClient({
  log: env.IS_DEVELOPMENT 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: env.DATABASE_URL
    }
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 10;
const INITIAL_DELAY_MS = 2000;
const MAX_DELAY_MS = 30000;

export const connectDatabase = async () => {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await prisma.$connect();
      logger.info('✅ Database connected successfully');
      if (env.IS_DEVELOPMENT) {
        const result = await prisma.$queryRaw`SELECT version()`;
        logger.debug('PostgreSQL version:', result);
      }
      return;
    } catch (error) {
      lastError = error;
      logger.warn(
        `❌ Database connection attempt ${attempt}/${MAX_RETRIES} failed: ${error?.message || error}`
      );
      if (attempt === MAX_RETRIES) {
        logger.error('❌ Database connection failed after all retries. Exiting.');
        process.exit(1);
      }
      const delay = Math.min(INITIAL_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
      logger.info(`⏳ Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }
  logger.error('❌ Database connection failed:', lastError?.message);
  process.exit(1);
};

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected gracefully');
  } catch (error) {
    logger.error('❌ Database disconnection error:', error.message);
  }
};

export default prisma;
