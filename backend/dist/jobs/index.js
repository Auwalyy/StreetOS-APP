"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const debtReminder_job_1 = require("./debtReminder.job");
const healthScore_job_1 = require("./healthScore.job");
const creditScore_job_1 = require("./creditScore.job");
const inventoryForecast_job_1 = require("./inventoryForecast.job");
const logger_1 = require("../utils/logger");
const initJobs = () => {
    // Debt reminders — every hour
    node_cron_1.default.schedule('0 * * * *', () => {
        (0, debtReminder_job_1.runDebtReminderJob)().catch((err) => logger_1.logger.error('Debt reminder job failed:', err));
    });
    // Health scores — daily at 2am
    node_cron_1.default.schedule('0 2 * * *', () => {
        (0, healthScore_job_1.runHealthScoreJob)().catch((err) => logger_1.logger.error('Health score job failed:', err));
    });
    // Credit scores — daily at 3am
    node_cron_1.default.schedule('0 3 * * *', () => {
        (0, creditScore_job_1.runCreditScoreJob)().catch((err) => logger_1.logger.error('Credit score job failed:', err));
    });
    // Inventory forecast — daily at 4am
    node_cron_1.default.schedule('0 4 * * *', () => {
        (0, inventoryForecast_job_1.runInventoryForecastJob)().catch((err) => logger_1.logger.error('Inventory forecast job failed:', err));
    });
    logger_1.logger.info('Background jobs initialized');
};
exports.initJobs = initJobs;
//# sourceMappingURL=index.js.map