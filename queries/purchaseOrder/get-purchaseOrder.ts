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
  return useQuery({
    queryKey: ['purchaseOrders', filters],
    queryFn: async () => {
      const result = await getPurchaseOrders(filters);
      // Handle both paginated and direct array responses
      return Array.isArray(result) ? result : result.data || [];
    },
    enabled,
    refetchOnWindowFocus: false,
  });
}
