import mongoose, { Document } from 'mongoose';
export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    resource: string;
    resourceId?: mongoose.Types.ObjectId;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}
declare const _default: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, {}> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AuditLog.d.ts.map