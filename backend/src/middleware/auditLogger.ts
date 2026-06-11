import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';

export const auditLogger = (action: string, resource: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (req.user) {
      AuditLog.create({
        userId: req.user._id,
        action,
        resource,
        resourceId: req.params.id,
        changes: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch(() => {});
    }
    next();
  };
};
