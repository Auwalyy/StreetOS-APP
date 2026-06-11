import { Router } from 'express';
import * as scoreController from '../controllers/score.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/health', scoreController.getHealthScore);
router.get('/health/history', scoreController.getHealthScoreHistory);
router.get('/credit', scoreController.getCreditScore);
router.get('/credit/history', scoreController.getCreditScoreHistory);
router.post('/refresh', scoreController.refreshScores);

export default router;
