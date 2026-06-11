import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';
import { sendSuccess } from '../utils/response';

export const getCashflow = async (req: Request, res: Response) => {
  const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'monthly';
  const data = await analyticsService.getCashflow(String(req.user!._id), period);
  sendSuccess(res, data, 'Cashflow data');
};

export const getProfitLoss = async (req: Request, res: Response) => {
  const from = new Date((req.query.from as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const to = new Date((req.query.to as string) || new Date());
  const data = await analyticsService.getProfitLoss(String(req.user!._id), from, to);
  sendSuccess(res, data, 'Profit & Loss');
};

export const getTopProducts = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const data = await analyticsService.getTopProducts(String(req.user!._id), limit);
  sendSuccess(res, data, 'Top products');
};

export const getRevenueTrends = async (req: Request, res: Response) => {
  const data = await analyticsService.getRevenueTrend(String(req.user!._id));
  sendSuccess(res, data, 'Revenue trends');
};

export const getDebtSummary = async (req: Request, res: Response) => {
  const data = await analyticsService.getOutstandingDebtSummary(String(req.user!._id));
  sendSuccess(res, data, 'Debt summary');
};
