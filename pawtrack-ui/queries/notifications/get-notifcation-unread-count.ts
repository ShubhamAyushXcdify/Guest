import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";


const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await fetch("/api/notification/unread/count");

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch unread count");
  }

  const data = await response.json();
  return data.count;
};

export const useUnreadNotificationCount = (enabled = true) => {
  const query = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: getUnreadNotificationCount,
    enabled,
    refetchOnWindowFocus: false,
  });

  if (query.error) {
    toast({
      title: "Error",
      description: (query.error as Error).message || "Failed to load unread notifications count",
      variant: "destructive",
    });
  }

  return query;
};
