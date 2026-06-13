"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSendNotification = exports.sendWhatsApp = exports.sendSMS = exports.sendPushNotification = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const Notification_1 = __importDefault(require("../models/Notification"));
const User_1 = __importDefault(require("../models/User"));
const sendPushNotification = async (fcmToken, title, body, data) => {
    try {
        await firebase_1.default.messaging().send({ token: fcmToken, notification: { title, body }, data });
    }
    catch (err) {
        logger_1.logger.error('Push notification failed:', err);
    }
};
exports.sendPushNotification = sendPushNotification;
const sendSMS = async (phone, message) => {
    try {
        await axios_1.default.post('https://api.ng.termii.com/api/sms/send', {
            to: phone,
            from: env_1.config.termii.senderId,
            sms: message,
            type: 'plain',
            channel: 'generic',
            api_key: env_1.config.termii.apiKey,
        });
    }
    catch (err) {
        logger_1.logger.error('SMS send failed:', err);
    }
};
exports.sendSMS = sendSMS;
const sendWhatsApp = async (phone, message) => {
    try {
        await axios_1.default.post(`https://graph.facebook.com/v18.0/${env_1.config.whatsapp.phoneId}/messages`, {
            messaging_product: 'whatsapp',
            to: phone.replace('+', ''),
            type: 'text',
            text: { body: message },
        }, { headers: { Authorization: `Bearer ${env_1.config.whatsapp.token}` } });
    }
    catch (err) {
        logger_1.logger.error('WhatsApp send failed:', err);
    }
};
exports.sendWhatsApp = sendWhatsApp;
const createAndSendNotification = async (userId, type, title, body, channel, data) => {
    const notif = await Notification_1.default.create({ userId, type, title, body, channel, data });
    const user = await User_1.default.findById(userId);
    if (!user)
        return notif;
    if (channel === 'push' && user.fcmToken) {
        await (0, exports.sendPushNotification)(user.fcmToken, title, body);
        await Notification_1.default.findByIdAndUpdate(notif._id, { status: 'sent', sentAt: new Date() });
    }
    else if (channel === 'sms') {
        await (0, exports.sendSMS)(user.phone, body);
        await Notification_1.default.findByIdAndUpdate(notif._id, { status: 'sent', sentAt: new Date() });
    }
    else if (channel === 'whatsapp' && user.whatsappNumber) {
        await (0, exports.sendWhatsApp)(user.whatsappNumber, body);
        await Notification_1.default.findByIdAndUpdate(notif._id, { status: 'sent', sentAt: new Date() });
    }
    return notif;
};
exports.createAndSendNotification = createAndSendNotification;
//# sourceMappingURL=notification.service.js.map