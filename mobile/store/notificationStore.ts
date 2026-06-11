import { create } from 'zustand';

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  status: string;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => n.status !== 'read').length,
    }),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => n._id === id ? { ...n, status: 'read' } : n),
      unreadCount: Math.max(state.unreadCount - 1, 0),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, status: 'read' })),
      unreadCount: 0,
    })),
}));
