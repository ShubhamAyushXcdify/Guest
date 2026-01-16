// Common types for Purchase Order Receiving History

export interface PurchaseOrderReceivingHistoryItem {
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
  lotNumber?: string;
  supplierId?: string;
  quantityInHand?: number;
  barcodeNumber?: string;
  shelf?: string;
  bin?: string;
  createdAt?: string;
  updatedAt?: string;
  productName?: string;
  clinicName?: string;
  supplierName?: string;
  receivedByName?: string;
  orderNumber?: string;
  productDetails?: {
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
    sellingPrice: number;
  }
}

export interface CreatePurchaseOrderReceivingHistoryData {
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
  lotNumber?: string;
  supplierId?: string;
  quantityOnHand?: number;
  barcode?: string;
  shelf?: string;
  bin?: string;
}

export interface UpdatePurchaseOrderReceivingHistoryData extends CreatePurchaseOrderReceivingHistoryData {
  id: string;
}

export interface PurchaseOrderReceivingHistoryFilters {
  clinicId?: string;
  dateFrom?: string;
  dateTo?: string;
  supplierId?: string;
  productId?: string;
  batchNumber?: string;
  receivedBy?: string;
  purchaseOrderId?: string;
  purchaseOrderItemId?: string;
  lotNumber?: string;
  productName?: string; // Add productName filter
  companyId?:string; // Add companyId filter
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
