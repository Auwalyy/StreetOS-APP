import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const roleGuard = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'Access denied: insufficient permissions', 403);
    }
    next();
  };
};
