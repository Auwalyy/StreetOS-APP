export declare const config: {
    env: string;
    port: number;
    apiPrefix: string;
    mongodb: {
        uri: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpires: string;
        refreshExpires: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    firebase: {
        projectId: string;
        privateKey: string;
        clientEmail: string;
    };
    aiService: {
        url: string;
    };
    termii: {
        apiKey: string;
        senderId: string;
    };
    whatsapp: {
        token: string;
        phoneId: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    encryption: {
        key: string;
    };
};
//# sourceMappingURL=env.d.ts.map