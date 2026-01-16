import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  PurchaseOrderReceivingHistoryItem,
  PaginatedResponse,
  PurchaseOrderReceivingHistoryFilters
} from "./types";

export const getPurchaseOrderReceivingHistoryByClinicId = async (
  clinicId: string,
  pageNumber = 1,
  pageSize = 10,
  productName?: string,
  companyId?: string
): Promise<PaginatedResponse<PurchaseOrderReceivingHistoryItem>> => {
  const params = new URLSearchParams();
  if (pageNumber) params.append("page", String(pageNumber));
  if (pageSize) params.append("pageSize", String(pageSize));
  if (productName) params.append("productName", productName);
  if (companyId) params.append("companyId", companyId);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`/api/purchaseOrderRecevingHiistory/clinic/${clinicId}${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch purchase order receiving history");
  }
  return response.json() as Promise<PaginatedResponse<PurchaseOrderReceivingHistoryItem>>;
};

export function useGetPurchaseOrderReceivingHistoryByClinicId(
  clinicId: string,
  pageNumber = 1,
  pageSize = 10,
  productName?: string,
  companyId?: string,
  enabled = true
) {
  return useQuery<PaginatedResponse<PurchaseOrderReceivingHistoryItem>, Error>({
    queryKey: ['purchaseOrderReceivingHistoryByClinicId', clinicId, pageNumber, pageSize, productName, companyId],
    queryFn: () => getPurchaseOrderReceivingHistoryByClinicId(clinicId, pageNumber, pageSize, productName, companyId),
    enabled: enabled && !!clinicId,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}
