import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import inventoryRoutes from './routes/inventory.routes';
import debtRoutes from './routes/debt.routes';
import customerRoutes from './routes/customer.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';
import passportRoutes from './routes/passport.routes';
import adminRoutes from './routes/admin.routes';
import webhookRoutes from './routes/webhook.routes';
import scoreRoutes from './routes/score.routes';
import advisorRoutes from './routes/advisor.routes';

// Jobs
import { initJobs } from './jobs';

const app = express();

// Trust proxy (required for Render, Railway, etc.)
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));
app.use(compression());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'streetos-api', timestamp: new Date().toISOString() });
});

// API Routes
const prefix = config.apiPrefix;
app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}/transactions`, transactionRoutes);
app.use(`${prefix}/inventory`, inventoryRoutes);
app.use(`${prefix}/debts`, debtRoutes);
app.use(`${prefix}/customers`, customerRoutes);
app.use(`${prefix}/analytics`, analyticsRoutes);
app.use(`${prefix}/notifications`, notificationRoutes);
app.use(`${prefix}/passport`, passportRoutes);
app.use(`${prefix}/admin`, adminRoutes);
app.use(`${prefix}/webhooks`, webhookRoutes);
app.use(`${prefix}/scores`, scoreRoutes);
app.use(`${prefix}/advisor`, advisorRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDatabase();
  initJobs();
  app.listen(config.port, () => {
    logger.info(`StreetOS API running on port ${config.port} [${config.env}]`);
  });
};

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
