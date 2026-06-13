"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const response_1 = require("../utils/response");
const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[target], { abortEarly: false });
        if (error) {
            const messages = error.details.map((d) => d.message);
            return (0, response_1.sendError)(res, messages.join(', '), 422);
        }
        next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map