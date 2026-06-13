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
exports.getTransactionSummary = exports.syncTransactions = exports.getTransaction = exports.createVoiceTransaction = exports.createTransaction = exports.listTransactions = void 0;
const txService = __importStar(require("../services/transaction.service"));
const response_1 = require("../utils/response");
const pagination_1 = require("../utils/pagination");
const listTransactions = async (req, res) => {
    const { page, limit, skip } = (0, pagination_1.getPagination)(req);
    const { data, total } = await txService.getTransactions(String(req.user._id), req.query, page, limit);
    (0, response_1.sendPaginated)(res, data, total, page, limit);
};
exports.listTransactions = listTransactions;
const createTransaction = async (req, res) => {
    const tx = await txService.createTransaction(String(req.user._id), req.body);
    (0, response_1.sendSuccess)(res, tx, 'Transaction recorded', 201);
};
exports.createTransaction = createTransaction;
const createVoiceTransaction = async (req, res) => {
    const audioBuffer = req.file?.buffer;
    if (!audioBuffer) {
        res.status(400).json({ success: false, message: 'Audio file required' });
        return;
    }
    const { language = 'en' } = req.body;
    const location = req.body.location ? JSON.parse(req.body.location) : undefined;
    const result = await txService.createVoiceTransaction(String(req.user._id), audioBuffer, language, location);
    (0, response_1.sendSuccess)(res, result, 'Voice transaction recorded', 201);
};
exports.createVoiceTransaction = createVoiceTransaction;
const getTransaction = async (req, res) => {
    const { data } = await txService.getTransactions(String(req.user._id), { _id: req.params.id }, 1, 1);
    (0, response_1.sendSuccess)(res, data[0] || null, 'Transaction details');
};
exports.getTransaction = getTransaction;
const syncTransactions = async (req, res) => {
    const results = await txService.syncOfflineTransactions(String(req.user._id), req.body.transactions);
    (0, response_1.sendSuccess)(res, results, 'Sync complete');
};
exports.syncTransactions = syncTransactions;
const getTransactionSummary = async (req, res) => {
    const period = req.query.period || 'daily';
    const summary = await txService.getTransactionSummary(String(req.user._id), period);
    (0, response_1.sendSuccess)(res, summary, 'Transaction summary');
};
exports.getTransactionSummary = getTransactionSummary;
//# sourceMappingURL=transaction.controller.js.map