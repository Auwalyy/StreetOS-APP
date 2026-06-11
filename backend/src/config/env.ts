import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000'),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  mongodb: {
    uri: required('MONGODB_URI'),
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  },

  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  },

  termii: {
    apiKey: process.env.TERMII_API_KEY || '',
    senderId: process.env.TERMII_SENDER_ID || 'StreetOS',
  },

  whatsapp: {
    token: process.env.WHATSAPP_TOKEN || '',
    phoneId: process.env.WHATSAPP_PHONE_ID || '',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || '',
  },
};
