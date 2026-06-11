import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();
router.use(authenticate, roleGuard('admin', 'super_admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.listUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/fraud-alerts', adminController.getFraudAlerts);
router.put('/fraud-alerts/:id/resolve', adminController.resolveFraudAlert);

export default router;
