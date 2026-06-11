import { Request, Response } from 'express';
import * as inventoryService from '../services/inventory.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { getPagination } from '../utils/pagination';

export const listInventory = async (req: Request, res: Response) => {
  const { page, limit } = getPagination(req);
  const { data, total } = await inventoryService.getInventory(String(req.user!._id), page, limit, req.query.search as string);
  sendPaginated(res, data, total, page, limit);
};

export const createItem = async (req: Request, res: Response) => {
  const item = await inventoryService.createInventoryItem(String(req.user!._id), req.body);
  sendSuccess(res, item, 'Inventory item created', 201);
};

export const updateItem = async (req: Request, res: Response) => {
  const item = await inventoryService.updateInventoryItem(String(req.user!._id), req.params.id, req.body);
  sendSuccess(res, item, 'Inventory item updated');
};

export const deleteItem = async (req: Request, res: Response) => {
  await inventoryService.updateInventoryItem(String(req.user!._id), req.params.id, { isActive: false });
  sendSuccess(res, null, 'Inventory item deleted');
};

export const getLowStockAlerts = async (req: Request, res: Response) => {
  const items = await inventoryService.getLowStockAlerts(String(req.user!._id));
  sendSuccess(res, items, 'Low stock items');
};

export const getForecast = async (req: Request, res: Response) => {
  const forecast = await inventoryService.getInventoryForecast(String(req.user!._id));
  sendSuccess(res, forecast, 'Inventory forecast');
};
