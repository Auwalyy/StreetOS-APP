import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { chatWithAdvisor, getDailyBriefing } from '../services/ai.service';
import MarketIntelligence from '../models/MarketIntelligence';

export const chat = async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) { res.status(400).json({ success: false, message: 'message is required' }); return; }
  const language = req.user?.language || 'en';
  const result = await chatWithAdvisor(String(req.user!._id), message, language);
  sendSuccess(res, result, 'AI response');
};

export const getDailyBriefingHandler = async (req: Request, res: Response) => {
  const language = req.user?.language || 'en';
  const result = await getDailyBriefing(String(req.user!._id), language);
  sendSuccess(res, result, 'Daily briefing');
};

export const getMarketIntelligenceHandler = async (req: Request, res: Response) => {
  const { region, category } = req.query;
  const data = await MarketIntelligence.find({
    ...(region ? { region } : req.user?.location?.state ? { region: req.user.location.state } : {}),
    ...(category && { productCategory: category }),
  }).sort({ createdAt: -1 }).limit(20);
  sendSuccess(res, data, 'Market intelligence');
};
