import { useMutation, useQueryClient } from "@tanstack/react-query";

export const deletePurchaseOrder = async (id: string) => {
  if (!id) {
    throw new Error('Purchase order ID is required');
  }

  const response = await fetch(`/api/purchaseOrder/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete purchase order');
  }

  return true;
};

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });
}
