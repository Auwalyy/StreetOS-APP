export declare const sendPushNotification: (fcmToken: string, title: string, body: string, data?: Record<string, string>) => Promise<void>;
export declare const sendSMS: (phone: string, message: string) => Promise<void>;
export declare const sendWhatsApp: (phone: string, message: string) => Promise<void>;
export declare const createAndSendNotification: (userId: string, type: string, title: string, body: string, channel: string, data?: Record<string, unknown>) => Promise<import("mongoose").Document<unknown, {}, import("../models/Notification").INotification, {}, {}> & import("../models/Notification").INotification & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=notification.service.d.ts.map