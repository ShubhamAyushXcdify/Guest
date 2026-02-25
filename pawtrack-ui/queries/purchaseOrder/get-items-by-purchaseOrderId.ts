import { useQuery } from "@tanstack/react-query";

interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  discount: number;
  extendedAmount: number;
  unitOfMeasure: string;
  unitsPerPackage: number;
  totalUnits: number;
  lotNumber?: string;
  batchNumber?: string;
  expirationDate?: string;
  dateOfManufacture?: string;
  actualDeliveryDate?: string;
  receivedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const getItemsByPurchaseOrderId = async (purchaseOrderId: string) => {
  if (!purchaseOrderId) {
    throw new Error('Purchase order ID is required');
  }

  const response = await fetch(`/api/purchaseOrder/${purchaseOrderId}/items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch purchase order items');
  }

  return response.json() as Promise<PurchaseOrderItem[]>;
};

export function useGetItemsByPurchaseOrderId(purchaseOrderId: string, enabled = true) {
  return useQuery({
    queryKey: ['purchaseOrderItems', purchaseOrderId],
    queryFn: () => getItemsByPurchaseOrderId(purchaseOrderId),
    enabled: !!purchaseOrderId && enabled,
    refetchOnWindowFocus: false,
  });
}
