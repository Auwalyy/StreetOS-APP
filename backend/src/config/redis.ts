import { createClient } from 'redis';
import { config } from './env';
import { logger } from '../utils/logger';

const redisClient = createClient({
  url: config.redis.url,
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis connected');
});

export const connectRedis = async (): Promise<void> => {
  if (!config.redis.url || process.env.REDIS_ENABLED === 'false') {
    logger.warn('Redis is disabled');
    return;
  }

  try {
    await redisClient.connect();
    logger.info('Redis connection established');
  } catch (error) {
    logger.warn('Redis unavailable. Continuing without Redis.');
  }
};

export default redisClient;