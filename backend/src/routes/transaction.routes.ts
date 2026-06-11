import { Router } from 'express';
import * as txController from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth';
import { voiceRateLimiter } from '../middleware/rateLimiter';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.use(authenticate);

router.get('/', txController.listTransactions);
router.post('/', txController.createTransaction);
router.post('/voice', voiceRateLimiter, upload.single('audio'), txController.createVoiceTransaction);
router.post('/sync', txController.syncTransactions);
router.get('/summary', txController.getTransactionSummary);
router.get('/:id', txController.getTransaction);

export default router;
