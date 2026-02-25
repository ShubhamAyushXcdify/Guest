import { useQuery } from "@tanstack/react-query";
import { SurgeryPostOp } from "./get-surgery-postop";

const getSurgeryPostOpByVisitId = async (visitId: string): Promise<SurgeryPostOp[]> => {
  try {
    if (!visitId) {
      throw new Error("visitId is required");
    }
    
    const response = await fetch(`/api/surgery/postop/visit/${visitId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No surgery post-op found for this visit - return empty array instead of throwing
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch surgery postop by visitId");
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
    console.error("Error fetching surgery postop by visit ID:", error);
    throw error;
  }
};

export function useGetSurgeryPostOpByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ["surgeryPostOpByVisitId", visitId],
    queryFn: () => getSurgeryPostOpByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 