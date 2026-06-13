import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const verifyOTP: (req: Request, res: Response) => Promise<void>;
export declare const resendOTP: (req: Request, res: Response) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
export declare const logout: (req: Request, res: Response) => Promise<void>;
export declare const getMe: (req: Request, res: Response) => Promise<void>;
export declare const updateFCMToken: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map