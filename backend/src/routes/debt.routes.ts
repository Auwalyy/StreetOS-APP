import { Router } from 'express';
import * as debtController from '../controllers/debt.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', debtController.listDebts);
router.post('/', debtController.createDebt);
router.get('/summary', debtController.getDebtSummary);
router.get('/:id', debtController.getDebtById);
router.post('/:id/payment', debtController.recordPayment);
router.post('/:id/settle', debtController.settleDebt);

export default router;
