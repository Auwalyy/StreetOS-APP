"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const logger_1 = require("./utils/logger");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const debt_routes_1 = __importDefault(require("./routes/debt.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const passport_routes_1 = __importDefault(require("./routes/passport.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const webhook_routes_1 = __importDefault(require("./routes/webhook.routes"));
const score_routes_1 = __importDefault(require("./routes/score.routes"));
const advisor_routes_1 = __importDefault(require("./routes/advisor.routes"));
// Jobs
const jobs_1 = require("./jobs");
const app = (0, express_1.default)();
// Security
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined', { stream: { write: (msg) => logger_1.logger.info(msg.trim()) } }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter_1.rateLimiter);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'streetos-api', timestamp: new Date().toISOString() });
});
// API Routes
const prefix = env_1.config.apiPrefix;
app.use(`${prefix}/auth`, auth_routes_1.default);
app.use(`${prefix}/transactions`, transaction_routes_1.default);
app.use(`${prefix}/inventory`, inventory_routes_1.default);
app.use(`${prefix}/debts`, debt_routes_1.default);
app.use(`${prefix}/customers`, customer_routes_1.default);
app.use(`${prefix}/analytics`, analytics_routes_1.default);
app.use(`${prefix}/notifications`, notification_routes_1.default);
app.use(`${prefix}/passport`, passport_routes_1.default);
app.use(`${prefix}/admin`, admin_routes_1.default);
app.use(`${prefix}/webhooks`, webhook_routes_1.default);
app.use(`${prefix}/scores`, score_routes_1.default);
app.use(`${prefix}/advisor`, advisor_routes_1.default);
app.use(errorHandler_1.errorHandler);
const start = async () => {
    await (0, database_1.connectDatabase)();
    // await connectRedis();
    (0, jobs_1.initJobs)();
    app.listen(env_1.config.port, () => {
        logger_1.logger.info(`StreetOS API running on port ${env_1.config.port} [${env_1.config.env}]`);
    });
};
start().catch((err) => {
    logger_1.logger.error('Failed to start server:', err);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=app.js.map