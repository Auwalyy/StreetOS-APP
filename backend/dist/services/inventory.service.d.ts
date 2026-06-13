import mongoose from 'mongoose';
export declare const getInventory: (userId: string, page: number, limit: number, search?: string) => Promise<{
    data: (mongoose.Document<unknown, {}, import("../models/Inventory").IInventory, {}, {}> & import("../models/Inventory").IInventory & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
}>;
export declare const createInventoryItem: (userId: string, data: Record<string, unknown>) => Promise<mongoose.Document<unknown, {}, import("../models/Inventory").IInventory, {}, {}> & import("../models/Inventory").IInventory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const updateInventoryItem: (userId: string, itemId: string, data: Record<string, unknown>) => Promise<mongoose.Document<unknown, {}, import("../models/Inventory").IInventory, {}, {}> & import("../models/Inventory").IInventory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const getLowStockAlerts: (userId: string) => Promise<(mongoose.Document<unknown, {}, import("../models/Inventory").IInventory, {}, {}> & import("../models/Inventory").IInventory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare const getInventoryForecast: (userId: string) => Promise<{
    dailySalesRate: number;
    daysUntilStockout: number | null;
    needsReorder: boolean;
    userId: mongoose.Types.ObjectId;
    name: string;
    category?: string;
    sku?: string;
    quantity: number;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    lowStockThreshold: number;
    images: string[];
    supplier?: string;
    reorderPoint?: number;
    forecastedStockoutDays?: number;
    isActive: boolean;
    _id: mongoose.Types.ObjectId;
    $locals: Record<string, unknown>;
    $op: "save" | "validate" | "remove" | null;
    $where: Record<string, unknown>;
    baseModelName?: string;
    collection: mongoose.Collection;
    db: mongoose.Connection;
    errors?: mongoose.Error.ValidationError;
    id?: any;
    isNew: boolean;
    schema: mongoose.Schema;
    __v: number;
}[]>;
//# sourceMappingURL=inventory.service.d.ts.map