import { Request, Response } from 'express';
export declare const listTransactions: (req: Request, res: Response) => Promise<void>;
export declare const createTransaction: (req: Request, res: Response) => Promise<void>;
export declare const createVoiceTransaction: (req: Request, res: Response) => Promise<void>;
export declare const getTransaction: (req: Request, res: Response) => Promise<void>;
export declare const syncTransactions: (req: Request, res: Response) => Promise<void>;
export declare const getTransactionSummary: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=transaction.controller.d.ts.map