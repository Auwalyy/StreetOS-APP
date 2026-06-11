import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import HealthScore from '../models/HealthScore';
import CreditScore from '../models/CreditScore';
import { calculateHealthScore, calculateCreditScore } from '../services/ai.service';

export const getHealthScore = async (req: Request, res: Response) => {
  const score = await HealthScore.findOne({ userId: req.user!._id }).sort({ calculatedAt: -1 });
  sendSuccess(res, score, 'Health score');
};

export const getHealthScoreHistory = async (req: Request, res: Response) => {
  const scores = await HealthScore.find({ userId: req.user!._id }).sort({ calculatedAt: -1 }).limit(12);
  sendSuccess(res, scores, 'Health score history');
};

export const getCreditScore = async (req: Request, res: Response) => {
  const score = await CreditScore.findOne({ userId: req.user!._id }).sort({ calculatedAt: -1 });
  sendSuccess(res, score, 'Credit score');
};

export const getCreditScoreHistory = async (req: Request, res: Response) => {
  const scores = await CreditScore.find({ userId: req.user!._id }).sort({ calculatedAt: -1 }).limit(12);
  sendSuccess(res, scores, 'Credit score history');
};

export const refreshScores = async (req: Request, res: Response) => {
  const [health, credit] = await Promise.all([
    calculateHealthScore(String(req.user!._id)),
    calculateCreditScore(String(req.user!._id)),
  ]);

  if (health) await HealthScore.create({ userId: req.user!._id, ...health, calculatedAt: new Date() });
  if (credit) await CreditScore.create({ userId: req.user!._id, ...credit, calculatedAt: new Date() });

  sendSuccess(res, { health, credit }, 'Scores refreshed');
};
