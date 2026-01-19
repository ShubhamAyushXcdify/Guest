import { useEffect, useState } from 'react';

export type NotificationType =
  | 'info'
  | 'warning'
  | 'success'
  | 'error'
  // backend-specific types
  | 'appointment_cancelled';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type?: NotificationType | string;
  isRead?: boolean;
}

const fallbackId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normaliseNotification = (incoming: Partial<Notification>): Notification => {
  const now = new Date().toISOString();

  // Map backend-specific types to UI types when needed
  const rawType = incoming.type;
  let mappedType: Notification['type'] = rawType;
  if (rawType === 'appointment_cancelled') {
    mappedType = 'appointment_cancelled';
  }

  return {
    id: incoming.id ?? fallbackId(),
    title: incoming.title || incoming.message || 'Notification',
    message: incoming.message || incoming.title || 'You have a new notification',
    timestamp: incoming.timestamp || now,
    type: mappedType ?? 'info',
    isRead: incoming.isRead ?? false,
  };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      const normalised = normaliseNotification(event.detail || {});
      console.log("[useNotifications] Received 'new-notification' event:", normalised);
      setNotifications((prev) => [normalised, ...prev]);
    };

    document.addEventListener('new-notification', handler as EventListener);
    console.log("[useNotifications] Registered 'new-notification' event listener");

    return () => {
      document.removeEventListener('new-notification', handler as EventListener);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, setNotifications, markAsRead };
};
