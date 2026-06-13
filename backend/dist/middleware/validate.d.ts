import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
export declare const validate: (schema: ObjectSchema, target?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map