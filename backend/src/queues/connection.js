import Redis from 'ioredis';
import { env } from '../config/env.js';

const redisUrl = process.env.REDIS_URL || env.REDIS_URL || 'redis://localhost:6379';

export function getRedisConnection() {
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy(times) {
      return Math.min(times * 200, 5000);
    }
  });
}

export function isQueueEnabled() {
  return Boolean(process.env.REDIS_URL || env.REDIS_URL);
}
