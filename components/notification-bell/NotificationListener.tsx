"use client";

import { useEffect } from "react";
import { notificationService } from "@/services/Notification/notificationService";
import { toast } from "sonner";
import { useCreateNotification } from "@/queries/notifications/create-notification";
import { useRootContext } from "@/context/RootContext"; // Import your context to get user
import { useQueryClient } from "@tanstack/react-query";

export const NotificationListener = () => {
  const createNotificationMutation = useCreateNotification();
  const { user } = useRootContext();
  const queryClient = useQueryClient(); 

  useEffect(() => {
    let isMounted = true;

    const setupNotifications = async () => {
      try {
        await notificationService.init();

        if (!isMounted) return;

        notificationService.onNotification(async (payload) => {
          console.log("[NotificationListener] Received:", payload);

          toast(payload.title || "New notification", {
            description: payload.message,
            duration: 5000,
          });

          if (user?.id) {
            try {
              await createNotificationMutation.mutateAsync({
                userId: user.id, 
                title: payload.title,
                message: payload.message,
                type: payload.type || 'info',
                data: payload.data ? JSON.stringify(payload.data) : undefined,
              });
              console.log("[NotificationListener] Saved to database");
              queryClient.invalidateQueries({ queryKey: ['notifications'] });
              queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
            } catch (error) {
              console.error("[NotificationListener] Failed to save to DB:", error);
            }
          } else {
            console.warn("[NotificationListener] No user ID available, skipping DB save");
          }
        });
      } catch (error) {
        console.error("[NotificationListener] Setup error:", error);
      }
    };

    setupNotifications();

    return () => {
      isMounted = false;
      notificationService.stop();
    };
  }, [createNotificationMutation, user?.id]);

  return null;
};