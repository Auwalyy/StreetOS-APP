export declare const findOrCreateCustomer: (userId: string, name: string, phone?: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/Customer").ICustomer, {}, {}> & import("../models/Customer").ICustomer & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getCustomers: (userId: string, page: number, limit: number, search?: string) => Promise<{
    data: (import("mongoose").Document<unknown, {}, import("../models/Customer").ICustomer, {}, {}> & import("../models/Customer").ICustomer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
}>;
export declare const getCustomerById: (userId: string, customerId: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/Customer").ICustomer, {}, {}> & import("../models/Customer").ICustomer & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const updateCustomerTrustScore: (customerId: string) => Promise<void>;
//# sourceMappingURL=customer.service.d.ts.map