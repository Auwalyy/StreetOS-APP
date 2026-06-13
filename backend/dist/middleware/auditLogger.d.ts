import { Request, Response, NextFunction } from 'express';
export declare const auditLogger: (action: string, resource: string) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auditLogger.d.ts.map