import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import HealthScore from '../models/HealthScore';
import CreditScore from '../models/CreditScore';
import { runHealthScoreForUser, runCreditScoreForUser } from '../jobs/healthScore.job';

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
  const userId = String(req.user!._id);
  const [health, credit] = await Promise.all([
    runHealthScoreForUser(userId),
    runCreditScoreForUser(userId),
  ]);
  sendSuccess(res, { health, credit }, 'Scores refreshed');
};
