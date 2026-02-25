import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { CreatePurchaseOrderReceivingHistoryData } from "./types";

export const createPurchaseOrderReceivingHistory = async (data: CreatePurchaseOrderReceivingHistoryData) => {
  const response = await fetch('/api/purchaseOrderRecevingHiistory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create purchase order receiving history');
  }

  return response.json();
};

export function useCreatePurchaseOrderReceivingHistory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPurchaseOrderReceivingHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrderReceivingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['receivedPurchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      toast({
        title: "Receiving History Created",
        description: "Successfully created purchase order receiving history",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
