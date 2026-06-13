"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const auditLogger = (action, resource) => {
    return async (req, _res, next) => {
        if (req.user) {
            AuditLog_1.default.create({
                userId: req.user._id,
                action,
                resource,
                resourceId: req.params.id,
                changes: req.body,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            }).catch(() => { });
        }
        next();
    };
};
exports.auditLogger = auditLogger;
//# sourceMappingURL=auditLogger.js.map