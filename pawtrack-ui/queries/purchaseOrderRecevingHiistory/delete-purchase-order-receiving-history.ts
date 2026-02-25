import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export const deletePurchaseOrderReceivingHistory = async (id: string) => {
  const response = await fetch(`/api/purchaseOrderRecevingHiistory/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete purchase order receiving history');
  }

  return response.json();
};

export const useDeletePurchaseOrderReceivingHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePurchaseOrderReceivingHistory,
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['purchaseOrderReceivingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['receivedPurchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      toast({
        title: "Receiving History Deleted",
        description: "Successfully deleted purchase order receiving history",
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
