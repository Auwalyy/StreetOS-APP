import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', inventoryController.listInventory);
router.post('/', inventoryController.createItem);
router.get('/alerts/low-stock', inventoryController.getLowStockAlerts);
router.get('/forecast', inventoryController.getForecast);
router.put('/:id', inventoryController.updateItem);
router.delete('/:id', inventoryController.deleteItem);

export default router;
