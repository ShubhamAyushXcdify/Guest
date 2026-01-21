import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

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

const getNotificationById = async (id: string): Promise<Notification> => {
  const response = await fetch(`/api/notification/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch notification");
  }

  return response.json();
};

export const useGetNotification = (id: string, enabled = true) => {
  const query = useQuery({
    queryKey: ["notification", id],
    queryFn: () => getNotificationById(id),
    enabled,
  });

  // Handle errors (React Query v5)
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error",
        description: query.error.message || "Failed to load notification",
        variant: "destructive",
      });
    }
  }, [query.error]);

  return query;
};
