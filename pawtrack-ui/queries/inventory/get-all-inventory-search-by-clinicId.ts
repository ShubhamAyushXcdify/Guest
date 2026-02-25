import { useQuery } from "@tanstack/react-query";
import { Product } from "./get-inventory";

export interface InventoryAllItem {
  id: string;
  clinicId: string;
  productId: string;
  product: Product;
  lotNumber?: string;
  batchNumber?: string;
  expirationDate?: string;
  [key: string]: any;
}

export interface InventoryAllResponse {
  items: InventoryAllItem[];
  totalCount: number;
}

export const getAllInventorySearchByClinicId = async (
  clinicId: string,
  searchTerm: string = ""
): Promise<InventoryAllResponse> => {
  const params = new URLSearchParams();
  if (searchTerm) {
    params.append("searchTerm", searchTerm);
  }
  const queryString = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(
    `/api/inventory/search/${clinicId}/all${queryString}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch all inventory");
  }

  return response.json();
};

export function useGetAllInventorySearchByClinicId(
  clinicId: string,
  searchTerm: string = "",
  enabled = true
) {
  return useQuery({
    queryKey: ["allInventorySearch", clinicId, searchTerm],
    queryFn: () => getAllInventorySearchByClinicId(clinicId, searchTerm),
    enabled: Boolean(clinicId) && enabled,
    refetchOnWindowFocus: false,
  });
}
