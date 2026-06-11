import { Request, Response } from 'express';
import * as debtService from '../services/debt.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { getPagination } from '../utils/pagination';
import Debt from '../models/Debt';

export const getDebtById = async (req: Request, res: Response) => {
  const debt = await Debt.findOne({ _id: req.params.id, userId: req.user!._id });
  if (!debt) { res.status(404).json({ success: false, message: 'Debt not found' }); return; }
  sendSuccess(res, debt, 'Debt details');
};

export const listDebts = async (req: Request, res: Response) => {
  const { page, limit } = getPagination(req);
  const query: Record<string, unknown> = { userId: req.user!._id };
  if (req.query.status) query.status = req.query.status;

  const [data, total] = await Promise.all([
    Debt.find(query).sort({ dueDate: 1 }).skip((page - 1) * limit).limit(limit),
    Debt.countDocuments(query),
  ]);
  sendPaginated(res, data, total, page, limit);
};

export const createDebt = async (req: Request, res: Response) => {
  const debt = await debtService.createDebt(String(req.user!._id), req.body);
  sendSuccess(res, debt, 'Debt record created', 201);
};

export const recordPayment = async (req: Request, res: Response) => {
  const { amount, method } = req.body;
  const debt = await debtService.recordPayment(String(req.user!._id), req.params.id, amount, method);
  sendSuccess(res, debt, 'Payment recorded');
};

export const settleDebt = async (req: Request, res: Response) => {
  const debt = await Debt.findOne({ _id: req.params.id, userId: req.user!._id });
  if (debt) {
    await debtService.recordPayment(String(req.user!._id), req.params.id, debt.balance);
  }
  sendSuccess(res, null, 'Debt settled');
};

export const getDebtSummary = async (req: Request, res: Response) => {
  const summary = await debtService.getDebtSummary(String(req.user!._id));
  sendSuccess(res, summary, 'Debt summary');
};
