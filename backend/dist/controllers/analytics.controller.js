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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebtSummary = exports.getRevenueTrends = exports.getTopProducts = exports.getProfitLoss = exports.getCashflow = void 0;
const analyticsService = __importStar(require("../services/analytics.service"));
const response_1 = require("../utils/response");
const getCashflow = async (req, res) => {
    const period = req.query.period || 'monthly';
    const data = await analyticsService.getCashflow(String(req.user._id), period);
    (0, response_1.sendSuccess)(res, data, 'Cashflow data');
};
exports.getCashflow = getCashflow;
const getProfitLoss = async (req, res) => {
    const from = new Date(req.query.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const to = new Date(req.query.to || new Date());
    const data = await analyticsService.getProfitLoss(String(req.user._id), from, to);
    (0, response_1.sendSuccess)(res, data, 'Profit & Loss');
};
exports.getProfitLoss = getProfitLoss;
const getTopProducts = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const data = await analyticsService.getTopProducts(String(req.user._id), limit);
    (0, response_1.sendSuccess)(res, data, 'Top products');
};
exports.getTopProducts = getTopProducts;
const getRevenueTrends = async (req, res) => {
    const data = await analyticsService.getRevenueTrend(String(req.user._id));
    (0, response_1.sendSuccess)(res, data, 'Revenue trends');
};
exports.getRevenueTrends = getRevenueTrends;
const getDebtSummary = async (req, res) => {
    const data = await analyticsService.getOutstandingDebtSummary(String(req.user._id));
    (0, response_1.sendSuccess)(res, data, 'Debt summary');
};
exports.getDebtSummary = getDebtSummary;
//# sourceMappingURL=analytics.controller.js.map