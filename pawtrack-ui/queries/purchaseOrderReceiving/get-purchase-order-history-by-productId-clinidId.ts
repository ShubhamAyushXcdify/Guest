import { useQuery } from "@tanstack/react-query";
export interface PurchaseOrderReceivingHistoryItem {
  id: string;
  purchaseOrderId: string;
  purchaseOrderItemId: string;
  productId: string;
  clinicId: string;
  quantityReceived: number;
  batchNumber: string;
  expiryDate: string;
  dateOfManufacture: string;
  receivedDate: string;
  receivedBy: string;
  notes: string;
  unitCost: number;
  lotNumber: string;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
  productName: string;
  clinicName: string;
  supplierName: string;
  receivedByName: string;
  orderNumber: string;
}

// Function to get purchase order receiving history by product ID and clinic ID
export const getPurchaseOrderHistoryByProductIdClinicId = async (
  productId: string,
  clinicId: string
): Promise<PurchaseOrderReceivingHistoryItem[]> => {
  if (!productId || !clinicId) return [];
  
  const response = await fetch(`/api/purchaseOrderReceiving/product/${productId}/clinic/${clinicId}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch purchase order receiving history');
  }
  
  return await response.json();
};

// Hook for getting purchase order receiving history by product ID and clinic ID
export const useGetPurchaseOrderHistoryByProductIdClinicId = (productId: string, clinicId: string) => {
  return useQuery({
    queryKey: ['purchaseOrderReceivingHistory', 'product', productId, 'clinic', clinicId],
    queryFn: () => getPurchaseOrderHistoryByProductIdClinicId(productId, clinicId),
    enabled: !!productId && !!clinicId,
    retry: 1,
  });
};
