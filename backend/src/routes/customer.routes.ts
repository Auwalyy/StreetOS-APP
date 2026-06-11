import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', customerController.listCustomers);
router.get('/:id', customerController.getCustomer);

export default router;
