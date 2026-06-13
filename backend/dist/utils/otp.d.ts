export declare const generateOTP: () => string;
export declare const storeOTP: (phone: string, otp: string) => Promise<void>;
export declare const verifyOTP: (phone: string, otp: string) => Promise<boolean>;
export declare const hashToken: (token: string) => string;
//# sourceMappingURL=otp.d.ts.map