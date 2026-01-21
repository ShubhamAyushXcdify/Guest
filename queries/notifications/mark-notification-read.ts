import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export type MarkNotificationReadPayload = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  additionalProp1?: string;
  additionalProp2?: string;
  additionalProp3?: string;
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

const markNotificationReadById = async (id: string, payload: MarkNotificationReadPayload) => {
  const response = await fetch(`/api/notification/${id}/read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to mark notification as read");
  }

  return response.json() as Promise<Notification>;
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: MarkNotificationReadPayload }) =>
      markNotificationReadById(id, payload || {}),
    onSuccess: (data) => {
      toast({
        title: "Notification marked as read",
        description: "The notification has been updated successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification", data.id] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
    onError: (error: any) => {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });
};
