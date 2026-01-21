import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export type AppNotification = {
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

const getNotifications = async (isRead?: boolean) => {
  const params = new URLSearchParams();
  if (isRead !== undefined) params.append('isRead', String(isRead));

  const response = await fetch(`/api/notification${params.toString() ? `?${params.toString()}` : ''}`);
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
};


export const useGetNotifications = (
  isRead?: boolean,
  enabled = true
) => {
 const query = useQuery<AppNotification[]>({
    queryKey: ["notifications", isRead],
    queryFn: () => getNotifications(isRead),
    enabled,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error",
        description: query.error.message || "Failed to load notifications",
        variant: "destructive",
      });
    }
  }, [query.error]);

  return query;
};
