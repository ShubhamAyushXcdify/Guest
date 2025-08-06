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
  quantityOnHand?: number;
  barcode?: string;
  shelf?: string;
  bin?: string;
  createdAt?: string;
  updatedAt?: string;
  // Extended fields from joins
  productName?: string;
  clinicName?: string;
  supplierName?: string;
  receivedByName?: string;
  orderNumber?: string;
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
