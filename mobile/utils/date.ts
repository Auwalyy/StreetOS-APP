import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy');
};

export const formatRelative = (date: string | Date): string =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatShortDate = (date: string | Date): string =>
  format(new Date(date), 'MMM d');

export const formatMonthYear = (date: string | Date): string =>
  format(new Date(date), 'MMM yyyy');
