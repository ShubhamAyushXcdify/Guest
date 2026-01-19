// In components/notification-bell/NotificationListener.tsx
"use client";

import { useEffect } from "react";
import { notificationService } from "@/services/Notification/notificationService";
import { toast } from "sonner";
import { Notification } from "@/hooks/useNotifications";

export const NotificationListener = () => {
  useEffect(() => {
    let isMounted = true;

    const buildNotification = (payload: any): Notification => {
      const now = new Date().toISOString();
      const fallbackId =
        (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

      return {
        id: payload?.id ?? fallbackId,
        title: payload?.title || payload?.message || "Notification",
        message: payload?.message || payload?.title || "You have a new notification",
        timestamp: payload?.timestamp || now,
        type: (payload?.type as any) ?? "info",
        isRead: false,
      };
    };

    const setupNotifications = async () => {
      try {
        // Initialize SignalR connection and wait for it to be ready
        await notificationService.init();

        if (!isMounted) return;

        // Subscribe to notifications after connection is established
        notificationService.onNotification((n) => {
          const notification = buildNotification(n);
          console.log("[NotificationListener] Received notification:", {
            type: notification.type,
            title: notification.title,
            message: notification.message,
            timestamp: notification.timestamp,
            data: n?.data,
          });

          // Show toast notification
          console.log('[NotificationListener] Attempting to show toast for notification');
          try {
            toast(notification.title || notification.message || "New notification", {
              description: notification.message,
              duration: 5000,
            });
            console.log('[NotificationListener] Toast shown successfully');
          } catch (toastError) {
            console.error('[NotificationListener] Error showing toast:', toastError);
          }

          // Dispatch custom event for the notification bell to pick up
          const event = new CustomEvent('new-notification', { detail: notification });
          document.dispatchEvent(event);
          console.log("[NotificationListener] Dispatched 'new-notification' event");
        });
      } catch (error) {
        console.error("[NotificationListener] Error setting up notifications:", error);
      }
    };

    setupNotifications();

    // Optional: cleanup on unmount
    return () => {
      isMounted = false;
      notificationService.stop();
    };
  }, []);

  return null; // This component does not render anything
};