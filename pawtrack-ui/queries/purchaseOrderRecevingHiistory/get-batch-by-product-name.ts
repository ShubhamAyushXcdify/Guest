import { useQuery } from "@tanstack/react-query";

// Extended type for the comprehensive batch data structure
export interface BatchDataItem {
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
  quantityInHand: number;
  barcode: string;
  shelf: string;
  bin: string;
  productDetails: {
    id: string;
    productNumber: string;
    name: string;
    genericName: string;
    category: string;
    manufacturer: string;
    ndcNumber: string;
    strength: string;
    dosageForm: string;
    unitOfMeasure: string;
    requiresPrescription: boolean;
    controlledSubstanceSchedule: string;
    brandName: string;
    storageRequirements: string;
    isActive: boolean;
    price: number;
  };
  supplierDetails: {
    id: string;
    clinicId: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    accountNumber: string;
    paymentTerms: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Function to get batch data by product name and clinic ID
export const getBatchByProductName = async (
  productName: string,
  clinicId: string
): Promise<BatchDataItem[]> => {
  if (!productName || !clinicId) return [];
  
  const response = await fetch(`/api/purchaseOrderRecevingHiistory/clinic/${clinicId}?productName=${encodeURIComponent(productName)}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch batch data by product name');
  }
  
  return await response.json();
};

// Hook for getting batch data by product name and clinic ID
export const useGetBatchByProductName = (productName: string, clinicId: string) => {
  return useQuery({
    queryKey: ['purchaseOrderReceivingHistory', 'batch', 'productName', productName, 'clinic', clinicId],
    queryFn: () => getBatchByProductName(productName, clinicId),
    enabled: !!productName && !!clinicId,
    retry: 1,
  });
};
