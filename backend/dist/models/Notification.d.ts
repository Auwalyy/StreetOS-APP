import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    body: string;
    type: string;
    channel: string;
    status: string;
    data?: Record<string, unknown>;
    scheduledAt?: Date;
    sentAt?: Date;
    readAt?: Date;
}
declare const _default: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map