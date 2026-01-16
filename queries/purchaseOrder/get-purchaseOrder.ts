import { useQuery } from "@tanstack/react-query";
import { PurchaseOrderData } from "./create-purchaseOrder";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export const getPurchaseOrders = async (filters: {
  clinicId?: string;
  dateFrom?: string;
  dateTo?: string;
  supplierId?: string;
  status?: string;
  orderNumber?: string;
  createdBy?: string;
  expectedDeliveryFrom?: string;
  expectedDeliveryTo?: string;
  actualDeliveryFrom?: string;
  actualDeliveryTo?: string;
  page?: number;
  pageSize?: number;
} = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`/api/purchaseOrder${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch purchase orders');
  }
  return response.json() as Promise<PaginatedResponse<PurchaseOrderData>>;
};

export function useGetPurchaseOrders(filters = {}, enabled = true) {
  return useQuery<PaginatedResponse<PurchaseOrderData>>({
    queryKey: ['purchaseOrders', filters],
    queryFn: async () => {
      const result = await getPurchaseOrders(filters);
      // Always return the backend paginated response { data, meta }
      return result as PaginatedResponse<PurchaseOrderData>;
    },
    enabled,
    refetchOnWindowFocus: false,
  });
}
