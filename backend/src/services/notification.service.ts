import admin from '../config/firebase';
import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import Notification from '../models/Notification';
import User from '../models/User';

export const sendPushNotification = async (fcmToken: string, title: string, body: string, data?: Record<string, string>) => {
  try {
    await admin.messaging().send({ token: fcmToken, notification: { title, body }, data });
  } catch (err) {
    logger.error('Push notification failed:', err);
  }
};

export const sendSMS = async (phone: string, message: string) => {
  try {
    await axios.post('https://api.ng.termii.com/api/sms/send', {
      to: phone,
      from: config.termii.senderId,
      sms: message,
      type: 'plain',
      channel: 'generic',
      api_key: config.termii.apiKey,
    });
  } catch (err) {
    logger.error('SMS send failed:', err);
  }
};

export const sendWhatsApp = async (phone: string, message: string) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${config.whatsapp.phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phone.replace('+', ''),
        type: 'text',
        text: { body: message },
      },
      { headers: { Authorization: `Bearer ${config.whatsapp.token}` } }
    );
  } catch (err) {
    logger.error('WhatsApp send failed:', err);
  }
};

export const createAndSendNotification = async (
  userId: string,
  type: string,
  title: string,
  body: string,
  channel: string,
  data?: Record<string, unknown>
) => {
  const notif = await Notification.create({ userId, type, title, body, channel, data });

  const user = await User.findById(userId);
  if (!user) return notif;

  if (channel === 'push' && user.fcmToken) {
    await sendPushNotification(user.fcmToken, title, body);
    await Notification.findByIdAndUpdate(notif._id, { status: 'sent', sentAt: new Date() });
  } else if (channel === 'sms') {
    await sendSMS(user.phone, body);
    await Notification.findByIdAndUpdate(notif._id, { status: 'sent', sentAt: new Date() });
  } else if (channel === 'whatsapp' && user.whatsappNumber) {
    await sendWhatsApp(user.whatsappNumber, body);
    await Notification.findByIdAndUpdate(notif._id, { status: 'sent', sentAt: new Date() });
  }

  return notif;
};
