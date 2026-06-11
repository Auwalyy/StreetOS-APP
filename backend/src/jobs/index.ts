import cron from 'node-cron';
import { runDebtReminderJob } from './debtReminder.job';
import { runHealthScoreJob } from './healthScore.job';
import { runCreditScoreJob } from './creditScore.job';
import { runInventoryForecastJob } from './inventoryForecast.job';
import { logger } from '../utils/logger';

export const initJobs = () => {
  // Debt reminders — every hour
  cron.schedule('0 * * * *', () => {
    runDebtReminderJob().catch((err) => logger.error('Debt reminder job failed:', err));
  });

  // Health scores — daily at 2am
  cron.schedule('0 2 * * *', () => {
    runHealthScoreJob().catch((err) => logger.error('Health score job failed:', err));
  });

  // Credit scores — daily at 3am
  cron.schedule('0 3 * * *', () => {
    runCreditScoreJob().catch((err) => logger.error('Credit score job failed:', err));
  });

  // Inventory forecast — daily at 4am
  cron.schedule('0 4 * * *', () => {
    runInventoryForecastJob().catch((err) => logger.error('Inventory forecast job failed:', err));
  });

  logger.info('Background jobs initialized');
};
