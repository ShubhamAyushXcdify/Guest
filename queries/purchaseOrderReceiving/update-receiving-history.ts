import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export interface UpdateReceivingHistoryData {
  id: string;
  purchaseOrderId: string;
  purchaseOrderItemId: string;
  productId: string;
  clinicId: string;
  quantityReceived: number;
  batchNumber: string;
  expiryDate?: string;
  dateOfManufacture?: string;
  receivedDate?: string;
  receivedBy?: string;
  notes?: string;
  unitCost?: number;
  lotNumber?: string;
  supplierId?: string;
  quantityOnHand?: number;
  barcode?: string;
  shelf?: string;
  bin?: string;
}

export const updateReceivingHistory = async (data: UpdateReceivingHistoryData) => {
  const response = await fetch(`/api/purchaseOrderReceiving/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update receiving history');
  }

  return response.json();
};

export const useUpdateReceivingHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReceivingHistory,
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
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