import { Router } from 'express';
import * as passportController from '../controllers/passport.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/verify/:passportId', passportController.verifyPassport);

router.use(authenticate);
router.get('/', passportController.getPassport);
router.post('/generate-pdf', passportController.generatePDF);
router.post('/share', passportController.sharePassport);

export default router;
