"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketIntelligenceHandler = exports.getDailyBriefingHandler = exports.chat = void 0;
const response_1 = require("../utils/response");
const ai_service_1 = require("../services/ai.service");
const MarketIntelligence_1 = __importDefault(require("../models/MarketIntelligence"));
const chat = async (req, res) => {
    const { message } = req.body;
    if (!message) {
        res.status(400).json({ success: false, message: 'message is required' });
        return;
    }
    const language = req.user?.language || 'en';
    const result = await (0, ai_service_1.chatWithAdvisor)(String(req.user._id), message, language);
    (0, response_1.sendSuccess)(res, result, 'AI response');
};
exports.chat = chat;
const getDailyBriefingHandler = async (req, res) => {
    const language = req.user?.language || 'en';
    const result = await (0, ai_service_1.getDailyBriefing)(String(req.user._id), language);
    (0, response_1.sendSuccess)(res, result, 'Daily briefing');
};
exports.getDailyBriefingHandler = getDailyBriefingHandler;
const getMarketIntelligenceHandler = async (req, res) => {
    const { region, category } = req.query;
    const data = await MarketIntelligence_1.default.find({
        ...(region ? { region } : req.user?.location?.state ? { region: req.user.location.state } : {}),
        ...(category && { productCategory: category }),
    }).sort({ createdAt: -1 }).limit(20);
    (0, response_1.sendSuccess)(res, data, 'Market intelligence');
};
exports.getMarketIntelligenceHandler = getMarketIntelligenceHandler;
//# sourceMappingURL=advisor.controller.js.map