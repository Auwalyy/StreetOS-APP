"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaginated = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({ success: true, message, data });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400) => {
    res.status(statusCode).json({ success: false, message });
};
exports.sendError = sendError;
const sendPaginated = (res, data, total, page, limit) => {
    res.json({
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    });
};
exports.sendPaginated = sendPaginated;
//# sourceMappingURL=response.js.map