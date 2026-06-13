"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = void 0;
const response_1 = require("../utils/response");
const roleGuard = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return (0, response_1.sendError)(res, 'Access denied: insufficient permissions', 403);
        }
        next();
    };
};
exports.roleGuard = roleGuard;
//# sourceMappingURL=roleGuard.js.map