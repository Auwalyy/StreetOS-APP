"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = void 0;
const redis_1 = require("redis");
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const redisClient = (0, redis_1.createClient)({
    url: env_1.config.redis.url,
});
redisClient.on('error', (err) => {
    logger_1.logger.error('Redis error:', err);
});
redisClient.on('connect', () => {
    logger_1.logger.info('Redis connected');
});
const connectRedis = async () => {
    if (process.env.REDIS_ENABLED !== 'true') {
        logger_1.logger.warn('Redis is disabled');
        return;
    }
    try {
        await redisClient.connect();
        logger_1.logger.info('Redis connection established');
    }
    catch (error) {
        logger_1.logger.warn('Redis unavailable. Continuing without Redis.');
    }
};
exports.connectRedis = connectRedis;
exports.default = redisClient;
//# sourceMappingURL=redis.js.map