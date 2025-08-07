import { useMutation, useQueryClient } from "@tanstack/react-query";

// Define types based on new API schema
export interface BatchData {
  quantityReceived: number;
  batchNumber: string;
  expiryDate?: string; // ISO format date string or empty
  dateOfManufacture?: string; // ISO format date string or empty
  notes?: string;
}

export interface ReceiveItemData {
  purchaseOrderItemId: string;
  productId: string;
  batches: BatchData[];
}

export interface ReceivePurchaseOrderData {
  purchaseOrderId: string;
  notes?: string;
  receivedBy: string;
  receivedItems: ReceiveItemData[];
}

export async function receivePurchaseOrderReceiving(data: ReceivePurchaseOrderData) {
  const response = await fetch("/api/purchaseOrderReceiving/receive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to receive purchase order");
  }
  return response.json();
}

export function useReceivePurchaseOrderReceiving() {
  const queryClient = useQueryClient();
  
  return useMutation({ 
    mutationFn: receivePurchaseOrderReceiving,
    onSuccess: () => {
      // Invalidate purchase orders query to refresh data
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder'] });
    }
  });
} 