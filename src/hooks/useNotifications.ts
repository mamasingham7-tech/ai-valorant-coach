import { useState, useEffect } from 'react';

export type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: 'info' | 'success' | 'warning' | 'error';
};

// Abstracted notification hook to manage notifications.
// Currently uses localStorage to persist, but can be swapped out with backend APIs.
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('val_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        // Initialize with some mock data so the user can see it works
        const mockData: Notification[] = [
          {
            id: '1',
            title: 'Welcome to AI Coach',
            message: 'Your account has been created successfully.',
            isRead: false,
            createdAt: new Date().toISOString(),
            type: 'success'
          },
          {
            id: '2',
            title: 'New Feature',
            message: 'Check out the new Live Overlay feature!',
            isRead: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            type: 'info'
          }
        ];
        setNotifications(mockData);
        localStorage.setItem('val_notifications', JSON.stringify(mockData));
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to local storage whenever notifications change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('val_notifications', JSON.stringify(notifications));
    }
  }, [notifications, loading]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };
}
