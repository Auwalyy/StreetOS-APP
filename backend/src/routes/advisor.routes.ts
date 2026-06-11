import { Router } from 'express';
import * as advisorController from '../controllers/advisor.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/chat', advisorController.chat);
router.get('/daily-briefing', advisorController.getDailyBriefingHandler);
router.get('/market-intelligence', advisorController.getMarketIntelligenceHandler);

export default router;
