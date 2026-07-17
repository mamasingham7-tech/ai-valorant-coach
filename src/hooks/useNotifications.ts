import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: number;
}

interface NotificationsState {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useNotifications = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (notification) =>
        set((state) => {
          // Prevent exact duplicates if recent
          const isDuplicate = state.notifications.some(
            (n) => n.title === notification.title && Date.now() - n.createdAt < 5000
          );
          if (isDuplicate) return state;

          const newNotification: NotificationItem = {
            ...notification,
            id: Math.random().toString(36).substring(2, 9),
            isRead: false,
            createdAt: Date.now(),
          };
          return { notifications: [newNotification, ...state.notifications] };
        }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearAll: () => set({ notifications: [] }),
      getUnreadCount: () => get().notifications.filter((n) => !n.isRead).length,
    }),
    {
      name: 'val_notifications',
    }
  )
);
