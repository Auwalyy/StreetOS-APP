export declare const registerUser: (data: {
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName?: string;
    businessType?: string;
    language?: string;
}) => Promise<{
    userId: import("mongoose").Types.ObjectId;
}>;
export declare const loginUser: (phone: string, password: string) => Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: import("mongoose").Types.ObjectId;
        firstName: string;
        lastName: string;
        role: string;
        language: string;
    };
}>;
export declare const verifyUserOTP: (phone: string, otp: string) => Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: import("mongoose").Types.ObjectId;
        firstName: string;
        role: string;
    };
}>;
export declare const refreshTokens: (token: string) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare const logoutUser: (refreshToken: string) => Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map