import { useQuery } from "@tanstack/react-query";
import { PurchaseOrderData } from "./create-purchaseOrder";

export const getPurchaseOrders = async () => {
  const response = await fetch('/api/purchaseOrder', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch purchase orders');
  }

  return response.json() as Promise<PurchaseOrderData[]>;
};

export function useGetPurchaseOrders(enabled = true) {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: getPurchaseOrders,
    enabled,
    refetchOnWindowFocus: false,
  });
}
