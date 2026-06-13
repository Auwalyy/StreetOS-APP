export declare const getOrCreatePassport: (userId: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/BusinessPassport").IBusinessPassport, {}, {}> & import("../models/BusinessPassport").IBusinessPassport & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const generatePassport: (userId: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/BusinessPassport").IBusinessPassport, {}, {}> & import("../models/BusinessPassport").IBusinessPassport & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const generateShareableLink: (userId: string) => Promise<{
    link: string;
    expiresAt: Date;
}>;
//# sourceMappingURL=passport.service.d.ts.map