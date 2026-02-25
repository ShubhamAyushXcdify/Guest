import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { UpdatePurchaseOrderReceivingHistoryData } from "./types";

export const updatePurchaseOrderReceivingHistory = async (data: UpdatePurchaseOrderReceivingHistoryData) => {
  const response = await fetch(`/api/purchaseOrderRecevingHiistory/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update purchase order receiving history');
  }

  return response.json();
};

export const useUpdatePurchaseOrderReceivingHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePurchaseOrderReceivingHistory,
    onSuccess: (_, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['purchaseOrderReceivingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['receivedPurchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      
      toast({
        title: "Receiving History Updated",
        description: `Successfully updated receiving history for batch ${variables.batchNumber}`,
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
};
