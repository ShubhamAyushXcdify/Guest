import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PurchaseOrderData } from "./create-purchaseOrder";

export const updatePurchaseOrder = async (data: PurchaseOrderData) => {
  if (!data.id) {
    throw new Error('Purchase order ID is required');
  }

  const response = await fetch('/api/purchaseOrder', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update purchase order');
  }

  return response.json();
};

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePurchaseOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', data.id] });
    },
  });
}
