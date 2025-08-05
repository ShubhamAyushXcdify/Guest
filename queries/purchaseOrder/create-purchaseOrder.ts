import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface PurchaseOrderItem {
  id?: string;
  purchaseOrderId: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived?: number;
  unitCost: number;
  discountPercentage: number;
  discountedAmount: number;
  extendedAmount: number;
  taxAmount: number;
  totalAmount: number;
  unitsPerPackage: number;
  totalUnits: number;
  lotNumber?: string | null;
  batchNumber?: string | null;
  expirationDate?: string | null;
  dateOfManufacture?: string | null;
  actualDeliveryDate?: string | null;
  receivedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  product?: {
    id: string;
    productNumber?: string;
    name: string;
    genericName?: string;
    category?: string;
    productType?: string;
    manufacturer?: string | null;
    ndcNumber?: string;
    strength?: string | null;
    dosageForm?: string;
    unitOfMeasure?: string;
    requiresPrescription?: boolean;
    controlledSubstanceSchedule?: string;
    storageRequirements?: string;
    isActive?: boolean;
    price?: number;
  };
}

export interface ReceivedItem {
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
  receivedBy: string;
  notes?: string;
  unitCost?: number;
  lotNumber?: string | null;
  supplierId?: string;
  createdAt?: string;
  updatedAt?: string;
  productName?: string;
  clinicName?: string;
  supplierName?: string;
  receivedByName?: string;
  orderNumber?: string;
  quantityInHand?: number | null;
  barcode?: string;
}

export interface PurchaseOrderData {
  id?: string;
  clinicId: string;
  supplierId: string;
  orderNumber?: string;
  orderDate?: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string | null;
  status: string;
  discountPercentage: number;
  discountedAmount: number;
  extendedAmount: number;
  totalAmount: number;
  notes: string;
  pdfBase64?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  supplier?: {
    id: string;
    clinicId: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    accountNumber?: string;
    paymentTerms?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  items: PurchaseOrderItem[];
  receivedItems?: ReceivedItem[];
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
