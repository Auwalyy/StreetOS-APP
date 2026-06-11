import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/cashflow', analyticsController.getCashflow);
router.get('/profit-loss', analyticsController.getProfitLoss);
router.get('/top-products', analyticsController.getTopProducts);
router.get('/revenue-trends', analyticsController.getRevenueTrends);
router.get('/debt-summary', analyticsController.getDebtSummary);

export default router;
