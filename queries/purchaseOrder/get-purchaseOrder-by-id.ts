import { useQuery } from "@tanstack/react-query";
import { PurchaseOrderData } from "./create-purchaseOrder";

export const getPurchaseOrderById = async (id: string) => {
  if (!id) {
    throw new Error('Purchase order ID is required');
  }

  const response = await fetch(`/api/purchaseOrder/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch purchase order');
  }

  return response.json() as Promise<PurchaseOrderData>;
};

export function useGetPurchaseOrderById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['purchaseOrder', id],
    queryFn: () => getPurchaseOrderById(id),
    enabled: !!id && enabled,
    refetchOnWindowFocus: false,
  });
}
