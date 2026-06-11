import { createClient } from 'redis';
import { config } from './env';
import { logger } from '../utils/logger';

const redisClient = createClient({ url: config.redis.url });

redisClient.on('error', (err) => logger.error('Redis error:', err));
redisClient.on('connect', () => logger.info('Redis connected'));

export const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
};

export default redisClient;
