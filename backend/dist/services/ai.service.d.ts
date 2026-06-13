export declare const processVoiceAudio: (audioBuffer: Buffer, language: string) => Promise<any>;
export declare const callAIService: (endpoint: string, data: Record<string, unknown>) => Promise<any>;
export declare const getDailyBriefing: (userId: string, language: string) => Promise<any>;
export declare const chatWithAdvisor: (userId: string, message: string, language: string) => Promise<any>;
export declare const calculateHealthScore: (userId: string) => Promise<any>;
export declare const calculateCreditScore: (userId: string) => Promise<any>;
export declare const getMarketIntelligence: (region: string, productCategory?: string) => Promise<any>;
//# sourceMappingURL=ai.service.d.ts.map