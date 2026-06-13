"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDebtReminderJob = void 0;
const Debt_1 = __importDefault(require("../models/Debt"));
const notification_service_1 = require("../services/notification.service");
const logger_1 = require("../utils/logger");
const runDebtReminderJob = async () => {
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const upcomingDebts = await Debt_1.default.find({
        status: { $in: ['pending', 'partial'] },
        dueDate: { $gte: now, $lte: in48h },
    }).populate('userId', 'firstName fcmToken whatsappNumber');
    const overdueDebts = await Debt_1.default.find({
        status: { $in: ['pending', 'partial'] },
        dueDate: { $lt: now },
    });
    // Mark overdue
    await Debt_1.default.updateMany({ status: { $in: ['pending', 'partial'] }, dueDate: { $lt: now } }, { status: 'overdue' });
    for (const debt of upcomingDebts) {
        const hoursUntilDue = Math.round((debt.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        const title = 'Debt Reminder';
        const body = `${debt.customerName} owes you ₦${debt.balance.toLocaleString()} — due in ${hoursUntilDue}h`;
        await (0, notification_service_1.createAndSendNotification)(String(debt.userId), 'debt_reminder', title, body, 'push');
        await Debt_1.default.findByIdAndUpdate(debt._id, {
            $push: { reminders: { sentAt: new Date(), channel: 'push', status: 'sent' } },
        });
    }
    logger_1.logger.info(`Debt reminders sent: ${upcomingDebts.length}, Overdue updated: ${overdueDebts.length}`);
};
exports.runDebtReminderJob = runDebtReminderJob;
//# sourceMappingURL=debtReminder.job.js.map