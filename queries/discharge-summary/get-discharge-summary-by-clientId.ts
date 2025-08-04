import { useQuery } from "@tanstack/react-query";

interface DischargeSummaryByClientParams {
  clientId: string;
  fromDate?: string;
  toDate?: string;
}

const getDischargeSummaryByClientId = async ({ 
  clientId, 
  fromDate, 
  toDate 
}: DischargeSummaryByClientParams) => {
  try {
    if (!clientId) {
      throw new Error("Client ID is required");
    }
    
    // Build the URL with query parameters
    let url = `/api/discharge-summary/client/${clientId}`;
    const queryParams = new URLSearchParams();
    
    if (fromDate) {
      queryParams.append('fromDate', fromDate);
    }
    
    if (toDate) {
      queryParams.append('toDate', toDate);
    }
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Failed to fetch discharge summaries");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching discharge summaries:", error);
    throw error;
  }
};

export function useGetDischargeSummaryByClientId(
  clientId: string, 
  fromDate?: string, 
  toDate?: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['discharge-summary', 'client', clientId, fromDate, toDate],
    queryFn: () => getDischargeSummaryByClientId({ clientId, fromDate, toDate }),
    enabled: !!clientId && enabled,
  });
}
