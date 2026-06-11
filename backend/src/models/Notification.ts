import mongoose, { Schema, Document } from 'mongoose';

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

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['debt_reminder', 'low_stock', 'health_score', 'transaction', 'system', 'advisor'],
      required: true,
    },
    channel: { type: String, enum: ['push', 'whatsapp', 'sms', 'in_app'], required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending',
    },
    data: { type: Schema.Types.Mixed },
    scheduledAt: Date,
    sentAt: Date,
    readAt: Date,
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
