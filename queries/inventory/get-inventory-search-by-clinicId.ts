import { useQuery } from "@tanstack/react-query";
import { InventoryData, Product } from "./get-inventory";

// Define the search response type
export interface InventorySearchItem {
  id: string;
  clinicId: string;
  productId: string;
  product: Product;
  lotNumber?: string;
  batchNumber?: string;
  quantityOnHand: number;
  expirationDate?: string;
  [key: string]: any; // For other fields
}

export interface InventorySearchResponse {
  items: InventorySearchItem[];
  totalCount?: number;
}

export const getInventorySearchByClinicId = async (
  clinicId: string,
  searchTerm: string = "",
  limit: number = 10
) => {
  const params = new URLSearchParams();
  
  if (searchTerm) {
    params.append("searchTerm", searchTerm);
  }
  
  if (limit) {
    params.append("limit", limit.toString());
  }
  
  // Always search by both name and code
  params.append("searchBy", "both");
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  try {
    const response = await fetch(
      `/api/inventory/search/${clinicId}${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to search inventory"
      );
    }
    
    const data = await response.json();
    return data as InventorySearchResponse;
  } catch (error: any) {
    throw error;
  }
};

export function useGetInventorySearchByClinicId(
  clinicId: string,
  searchTerm: string = "",
  limit: number = 10,
  enabled = true
) {
  return useQuery({
    queryKey: ["inventorySearch", clinicId, searchTerm, limit],
    queryFn: () => getInventorySearchByClinicId(clinicId, searchTerm, limit),
    enabled: Boolean(clinicId) && enabled,
    refetchOnWindowFocus: false,
  });
}
