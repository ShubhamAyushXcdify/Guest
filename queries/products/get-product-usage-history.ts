import { useQuery } from "@tanstack/react-query";

export interface ProductUsageHistory {
  clinicName: string;
  clientName: string;
  patientName: string;
  quantityGiven: number;
  doseFrequency: string;
  numberOfDaysGiven: number;
  appointmentType: string;
  dateGiven: string;
}

export interface ProductUsageHistoryResponse {
  items: ProductUsageHistory[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const getProductUsageHistory = async (
  id: string,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<ProductUsageHistoryResponse> => {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }
    
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(`/api/products/${id}/usage-history?${params}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch product usage history");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching product usage history:", error);
    throw error;
  }
};

export const useGetProductUsageHistory = (
  id: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  enabled = true
) => {
  return useQuery({
    queryKey: ['productUsageHistory', id, pageNumber, pageSize],
    queryFn: () => getProductUsageHistory(id, pageNumber, pageSize),
    enabled: !!id && enabled,
    placeholderData: (previousData) => previousData
  });
};


export default getProductUsageHistory;
