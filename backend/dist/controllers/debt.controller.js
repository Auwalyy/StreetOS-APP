"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebtSummary = exports.settleDebt = exports.recordPayment = exports.createDebt = exports.listDebts = exports.getDebtById = void 0;
const debtService = __importStar(require("../services/debt.service"));
const response_1 = require("../utils/response");
const pagination_1 = require("../utils/pagination");
const Debt_1 = __importDefault(require("../models/Debt"));
const getDebtById = async (req, res) => {
    const debt = await Debt_1.default.findOne({ _id: req.params.id, userId: req.user._id });
    if (!debt) {
        res.status(404).json({ success: false, message: 'Debt not found' });
        return;
    }
    (0, response_1.sendSuccess)(res, debt, 'Debt details');
};
exports.getDebtById = getDebtById;
const listDebts = async (req, res) => {
    const { page, limit } = (0, pagination_1.getPagination)(req);
    const query = { userId: req.user._id };
    if (req.query.status)
        query.status = req.query.status;
    const [data, total] = await Promise.all([
        Debt_1.default.find(query).sort({ dueDate: 1 }).skip((page - 1) * limit).limit(limit),
        Debt_1.default.countDocuments(query),
    ]);
    (0, response_1.sendPaginated)(res, data, total, page, limit);
};
exports.listDebts = listDebts;
const createDebt = async (req, res) => {
    const debt = await debtService.createDebt(String(req.user._id), req.body);
    (0, response_1.sendSuccess)(res, debt, 'Debt record created', 201);
};
exports.createDebt = createDebt;
const recordPayment = async (req, res) => {
    const { amount, method } = req.body;
    const debt = await debtService.recordPayment(String(req.user._id), req.params.id, amount, method);
    (0, response_1.sendSuccess)(res, debt, 'Payment recorded');
};
exports.recordPayment = recordPayment;
const settleDebt = async (req, res) => {
    const debt = await Debt_1.default.findOne({ _id: req.params.id, userId: req.user._id });
    if (debt) {
        await debtService.recordPayment(String(req.user._id), req.params.id, debt.balance);
    }
    (0, response_1.sendSuccess)(res, null, 'Debt settled');
};
exports.settleDebt = settleDebt;
const getDebtSummary = async (req, res) => {
    const summary = await debtService.getDebtSummary(String(req.user._id));
    (0, response_1.sendSuccess)(res, summary, 'Debt summary');
};
exports.getDebtSummary = getDebtSummary;
//# sourceMappingURL=debt.controller.js.map