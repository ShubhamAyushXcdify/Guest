import { useMutation, useQueryClient } from "@tanstack/react-query";

interface PurchaseOrderItem {
  id?: string;
  purchaseOrderId?: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived?: number;
  unitCost: number;
  totalCost: number;
  discount?: number;
  extendedAmount?: number;
  unitOfMeasure?: string;
  unitsPerPackage?: number;
  totalUnits?: number;
}

export interface PurchaseOrderData {
  id?: string;
  clinicId: string;
  supplierId: string;
  orderNumber?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status?: string;
  subtotal?: number;
  taxAmount?: number;
  discount?: number;
  extendedAmount?: number;
  totalAmount?: number;
  notes?: string;
  createdBy?: string;
  items?: PurchaseOrderItem[];
}

export const createPurchaseOrder = async (data: PurchaseOrderData) => {
  const response = await fetch('/api/purchaseOrder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create purchase order');
  }

  return response.json();
};

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });
}
