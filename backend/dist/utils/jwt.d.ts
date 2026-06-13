interface TokenPayload {
    sub: string;
    role: string;
    jti: string;
}
export declare const generateAccessToken: (userId: string, role: string) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyAccessToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => {
    sub: string;
    jti: string;
};
export {};
//# sourceMappingURL=jwt.d.ts.map