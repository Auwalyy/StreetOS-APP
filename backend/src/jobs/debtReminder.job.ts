import Debt from '../models/Debt';
import { createAndSendNotification } from '../services/notification.service';
import { logger } from '../utils/logger';

export const runDebtReminderJob = async () => {
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const upcomingDebts = await Debt.find({
    status: { $in: ['pending', 'partial'] },
    dueDate: { $gte: now, $lte: in48h },
  }).populate('userId', 'firstName fcmToken whatsappNumber');

  const overdueDebts = await Debt.find({
    status: { $in: ['pending', 'partial'] },
    dueDate: { $lt: now },
  });

  // Mark overdue
  await Debt.updateMany(
    { status: { $in: ['pending', 'partial'] }, dueDate: { $lt: now } },
    { status: 'overdue' }
  );

  for (const debt of upcomingDebts) {
    const hoursUntilDue = Math.round((debt.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    const title = 'Debt Reminder';
    const body = `${debt.customerName} owes you ₦${debt.balance.toLocaleString()} — due in ${hoursUntilDue}h`;

    await createAndSendNotification(
      String(debt.userId),
      'debt_reminder',
      title,
      body,
      'push'
    );

    await Debt.findByIdAndUpdate(debt._id, {
      $push: { reminders: { sentAt: new Date(), channel: 'push', status: 'sent' } },
    });
  }

  logger.info(`Debt reminders sent: ${upcomingDebts.length}, Overdue updated: ${overdueDebts.length}`);
};
