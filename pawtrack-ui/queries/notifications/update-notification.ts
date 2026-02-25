import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export type NotificationUpdatePayload = {
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  data?: string;
  createdAt: string;
  updatedAt: string;
};

const updateNotificationById = async (id: string, payload: NotificationUpdatePayload): Promise<Notification> => {
  const response = await fetch(`/api/notification/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update notification");
  }

  return response.json();
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NotificationUpdatePayload }) =>
      updateNotificationById(id, payload),
    onSuccess: (data) => {
      toast({
        title: "Notification updated",
        description: "The notification has been updated successfully.",
        variant: "success",
      });

      // ✅ Correct v5 syntax
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification", data.id] });
    },
    onError: (error: any) => {
      console.error("Error updating notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update notification",
        variant: "destructive",
      });
    },
  });
};
