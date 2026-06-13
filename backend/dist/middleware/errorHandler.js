"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, _next) => {
    logger_1.logger.error(`${err.message} — ${req.method} ${req.url}`, { stack: err.stack });
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map