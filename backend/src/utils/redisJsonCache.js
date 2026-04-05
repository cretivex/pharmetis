import Redis from 'ioredis';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const REDIS_URL = process.env.REDIS_URL || env?.REDIS_URL;

let redisClient = null;
let redisUnavailableLogged = false;

function getRedisClient() {
  if (!REDIS_URL) return null;
  if (!redisClient) {
    try {
      redisClient = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
      });
      redisClient.on('error', (err) => {
        if (!redisUnavailableLogged) {
          redisUnavailableLogged = true;
          logger.warn(`Redis cache unavailable: ${err.message}`);
        }
      });
    } catch (err) {
      if (!redisUnavailableLogged) {
        redisUnavailableLogged = true;
        logger.warn(`Redis cache init failed: ${err.message}`);
      }
      return null;
    }
  }
  return redisClient;
}

/**
 * Stable key for GET /api/suppliers list (same params → same key).
 */
export function suppliersListCacheKey(query = {}) {
  const stable = {
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 20),
    search: query.search ?? '',
    country: query.country ?? '',
    isVerified:
      query.isVerified === undefined || query.isVerified === ''
        ? ''
        : String(query.isVerified),
    isActive:
      query.isActive === undefined || query.isActive === ''
        ? ''
        : String(query.isActive),
    sortBy: query.sortBy ?? 'createdAt',
    sortOrder: query.sortOrder ?? 'desc',
  };
  const hash = crypto.createHash('sha256').update(JSON.stringify(stable)).digest('hex').slice(0, 32);
  return `suppliers:list:v1:${hash}`;
}

export async function getJson(key) {
  const r = getRedisClient();
  if (!r) return null;
  try {
    const raw = await r.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setJson(key, value, ttlSeconds) {
  const r = getRedisClient();
  if (!r) return;
  try {
    await r.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    /* ignore — graceful degradation */
  }
}
