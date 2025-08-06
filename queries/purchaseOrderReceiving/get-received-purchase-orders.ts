import { useQuery } from "@tanstack/react-query";
import { ReceivedItem } from "@/queries/purchaseOrder/create-purchaseOrder";

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ReceivedPurchaseOrderFilters {
  clinicId?: string;
  dateFrom?: string;
  dateTo?: string;
  supplierId?: string;
  productId?: string;
  batchNumber?: string;
  receivedBy?: string;
  page?: number;
  pageSize?: number;
}

export const getReceivedPurchaseOrders = async (filters: ReceivedPurchaseOrderFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`/api/purchaseOrderReceiving${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch received purchase orders');
  }
  return response.json() as Promise<PaginatedResponse<ReceivedItem>>;
};

export function useGetReceivedPurchaseOrders(filters = {}, enabled = true) {
  return useQuery({
    queryKey: ['receivedPurchaseOrders', filters],
    queryFn: async () => {
      const result = await getReceivedPurchaseOrders(filters);
      // Handle both paginated and direct array responses
      return Array.isArray(result) ? result : result.data || [];
    },
    enabled,
    refetchOnWindowFocus: false,
  });
} 