import { useQuery } from "@tanstack/react-query";
import { SurgeryPreOp } from "./get-surgery-preop";

const getSurgeryPreOpByVisitId = async (visitId: string): Promise<SurgeryPreOp[]> => {
  try {
    if (!visitId) {
      throw new Error("visitId is required");
    }
    
    const response = await fetch(`/api/surgery/preop/visit/${visitId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No surgery pre-op found for this visit - return empty array instead of throwing
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch surgery preop by visitId");
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
    console.error("Error fetching surgery preop by visit ID:", error);
    throw error;
  }
};

export function useGetSurgeryPreOpByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ["surgeryPreOpByVisitId", visitId],
    queryFn: () => getSurgeryPreOpByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 