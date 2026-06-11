import mongoose, { Schema, Document } from 'mongoose';

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

const InventorySchema = new Schema<IInventory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: String,
    sku: String,
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, default: 'pieces' },
    costPrice: { type: Number, min: 0, default: 0 },
    sellingPrice: { type: Number, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    images: [String],
    supplier: String,
    reorderPoint: Number,
    forecastedStockoutDays: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

InventorySchema.index({ userId: 1, name: 1 });
InventorySchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IInventory>('Inventory', InventorySchema);
