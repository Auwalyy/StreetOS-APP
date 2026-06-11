import { Request, Response } from 'express';
import * as txService from '../services/transaction.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { getPagination } from '../utils/pagination';

export const listTransactions = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { data, total } = await txService.getTransactions(String(req.user!._id), req.query, page, limit);
  sendPaginated(res, data, total, page, limit);
};

export const createTransaction = async (req: Request, res: Response) => {
  const tx = await txService.createTransaction(String(req.user!._id), req.body);
  sendSuccess(res, tx, 'Transaction recorded', 201);
};

export const createVoiceTransaction = async (req: Request, res: Response) => {
  const audioBuffer = req.file?.buffer;
  if (!audioBuffer) {
    res.status(400).json({ success: false, message: 'Audio file required' });
    return;
  }
  const { language = 'en' } = req.body;
  const location = req.body.location ? JSON.parse(req.body.location) : undefined;
  const result = await txService.createVoiceTransaction(String(req.user!._id), audioBuffer, language, location);
  sendSuccess(res, result, 'Voice transaction recorded', 201);
};

export const getTransaction = async (req: Request, res: Response) => {
  const { data } = await txService.getTransactions(String(req.user!._id), { _id: req.params.id }, 1, 1);
  sendSuccess(res, data[0] || null, 'Transaction details');
};

export const syncTransactions = async (req: Request, res: Response) => {
  const results = await txService.syncOfflineTransactions(String(req.user!._id), req.body.transactions);
  sendSuccess(res, results, 'Sync complete');
};

export const getTransactionSummary = async (req: Request, res: Response) => {
  const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'daily';
  const summary = await txService.getTransactionSummary(String(req.user!._id), period);
  sendSuccess(res, summary, 'Transaction summary');
};
