"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshScores = exports.getCreditScoreHistory = exports.getCreditScore = exports.getHealthScoreHistory = exports.getHealthScore = void 0;
const response_1 = require("../utils/response");
const HealthScore_1 = __importDefault(require("../models/HealthScore"));
const CreditScore_1 = __importDefault(require("../models/CreditScore"));
const healthScore_job_1 = require("../jobs/healthScore.job");
const creditScore_job_1 = require("../jobs/creditScore.job");
const getHealthScore = async (req, res) => {
    const score = await HealthScore_1.default.findOne({ userId: req.user._id }).sort({ calculatedAt: -1 });
    (0, response_1.sendSuccess)(res, score, 'Health score');
};
exports.getHealthScore = getHealthScore;
const getHealthScoreHistory = async (req, res) => {
    const scores = await HealthScore_1.default.find({ userId: req.user._id }).sort({ calculatedAt: -1 }).limit(12);
    (0, response_1.sendSuccess)(res, scores, 'Health score history');
};
exports.getHealthScoreHistory = getHealthScoreHistory;
const getCreditScore = async (req, res) => {
    const score = await CreditScore_1.default.findOne({ userId: req.user._id }).sort({ calculatedAt: -1 });
    (0, response_1.sendSuccess)(res, score, 'Credit score');
};
exports.getCreditScore = getCreditScore;
const getCreditScoreHistory = async (req, res) => {
    const scores = await CreditScore_1.default.find({ userId: req.user._id }).sort({ calculatedAt: -1 }).limit(12);
    (0, response_1.sendSuccess)(res, scores, 'Credit score history');
};
exports.getCreditScoreHistory = getCreditScoreHistory;
const refreshScores = async (req, res) => {
    const userId = String(req.user._id);
    const [health, credit] = await Promise.all([
        (0, healthScore_job_1.runHealthScoreForUser)(userId),
        (0, creditScore_job_1.runCreditScoreForUser)(userId),
    ]);
    (0, response_1.sendSuccess)(res, { health, credit }, 'Scores refreshed');
};
exports.refreshScores = refreshScores;
//# sourceMappingURL=score.controller.js.map