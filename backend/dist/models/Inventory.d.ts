import mongoose, { Document } from 'mongoose';
export interface IInventory extends Document {
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
}
declare const _default: mongoose.Model<IInventory, {}, {}, {}, mongoose.Document<unknown, {}, IInventory, {}, {}> & IInventory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Inventory.d.ts.map