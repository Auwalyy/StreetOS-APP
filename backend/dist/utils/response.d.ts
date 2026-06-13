import { Response } from 'express';
export declare const sendSuccess: (res: Response, data: unknown, message?: string, statusCode?: number) => void;
export declare const sendError: (res: Response, message: string, statusCode?: number) => void;
export declare const sendPaginated: (res: Response, data: unknown[], total: number, page: number, limit: number) => void;
//# sourceMappingURL=response.d.ts.map