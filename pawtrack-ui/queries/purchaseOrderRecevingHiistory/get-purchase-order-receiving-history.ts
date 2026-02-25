import { useQuery } from "@tanstack/react-query";
import {
  PurchaseOrderReceivingHistoryItem,
  PurchaseOrderReceivingHistoryFilters,
  PaginatedResponse
} from "./types";

export const getPurchaseOrderReceivingHistory = async (filters: PurchaseOrderReceivingHistoryFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`/api/purchaseOrderRecevingHiistory${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch purchase order receiving history');
  }
  return response.json() as Promise<PaginatedResponse<PurchaseOrderReceivingHistoryItem>>;
};

export function useGetPurchaseOrderReceivingHistory(filters = {}, enabled = true) {
  return useQuery({
    queryKey: ['purchaseOrderReceivingHistory', filters],
    queryFn: async () => {
      const result = await getPurchaseOrderReceivingHistory(filters);
      // Handle both paginated and direct array responses
      return Array.isArray(result) ? result : result.data || [];
    },
    enabled,
    refetchOnWindowFocus: false,
  });
}

export const getPurchaseOrderReceivingHistoryById = async (id: string): Promise<PurchaseOrderReceivingHistoryItem> => {
  const response = await fetch(`/api/purchaseOrderRecevingHiistory/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch purchase order receiving history');
  }
  return response.json();
};

export function useGetPurchaseOrderReceivingHistoryById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['purchaseOrderReceivingHistory', id],
    queryFn: () => getPurchaseOrderReceivingHistoryById(id),
    enabled: enabled && !!id,
    refetchOnWindowFocus: false,
  });
}
