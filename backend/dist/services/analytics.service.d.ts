export declare const getCashflow: (userId: string, period: "daily" | "weekly" | "monthly") => Promise<any[]>;
export declare const getProfitLoss: (userId: string, from: Date, to: Date) => Promise<{
    revenue: any;
    expenses: any;
    profit: number;
    breakdown: any[];
}>;
export declare const getTopProducts: (userId: string, limit?: number) => Promise<any[]>;
export declare const getRevenueTrend: (userId: string) => Promise<any[]>;
export declare const getOutstandingDebtSummary: (userId: string) => Promise<any[]>;
//# sourceMappingURL=analytics.service.d.ts.map