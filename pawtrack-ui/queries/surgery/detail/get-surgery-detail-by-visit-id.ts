import { useQuery } from "@tanstack/react-query";
import { SurgeryDetail } from "./get-surgery-detail";

const getSurgeryDetailByVisitId = async (visitId: string): Promise<SurgeryDetail[]> => {
  try {
    if (!visitId) {
      throw new Error("visitId is required");
    }
    
    const response = await fetch(`/api/surgery/detail/visit/${visitId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No surgery detail found for this visit - return empty array instead of throwing
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch surgery detail by visitId");
    }
    
    const data = await response.json();
    
    // Handle null response (no data found)
    if (data === null) {
      return [];
    }
    
    if (Array.isArray(data)) {
      return data;
    } else if (data) {
      return [data];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching surgery detail by visit ID:", error);
    throw error;
  }
};

export function useGetSurgeryDetailByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ["surgeryDetailByVisitId", visitId],
    queryFn: () => getSurgeryDetailByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 