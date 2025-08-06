import { useQuery } from "@tanstack/react-query";
import { PurchaseOrderReceivingHistoryItem } from "./types";

// Function to get purchase order receiving history by product ID and clinic ID
export const getPurchaseOrderHistoryByProductIdClinicId = async (
  productId: string,
  clinicId: string
): Promise<PurchaseOrderReceivingHistoryItem[]> => {
  if (!productId || !clinicId) return [];
  
  const response = await fetch(`/api/purchaseOrderRecevingHiistory/product/${productId}/clinic/${clinicId}`);
  
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
