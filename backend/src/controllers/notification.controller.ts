import { Request, Response } from 'express';
import { sendSuccess, sendPaginated } from '../utils/response';
import { getPagination } from '../utils/pagination';
import Notification from '../models/Notification';

export const listNotifications = async (req: Request, res: Response) => {
  const { page, limit } = getPagination(req);
  const query = { userId: req.user!._id };
  const [data, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments(query),
  ]);
  sendPaginated(res, data, total, page, limit);
};

export const markRead = async (req: Request, res: Response) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!._id },
    { status: 'read', readAt: new Date() }
  );
  sendSuccess(res, null, 'Notification marked as read');
};

export const markAllRead = async (req: Request, res: Response) => {
  await Notification.updateMany(
    { userId: req.user!._id, status: { $ne: 'read' } },
    { status: 'read', readAt: new Date() }
  );
  sendSuccess(res, null, 'All notifications marked as read');
};
