import { useQuery } from "@tanstack/react-query";
import { VitalDetail } from "./create-vital-detail";

const getVitalDetailByVisitId = async (visitId: string): Promise<VitalDetail | null> => {
  try {
    if (!visitId) {
      throw new Error("Visit ID is required");
    }
    
    const response = await fetch(`/api/VitalDetail/visit/${visitId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch vital detail by visit ID");
    }
    
    const result = await response.json();
    
    // Handle null response (no data found)
    if (result === null) {
      return null;
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching vital detail by visit ID:", error);
    throw error;
  }
};

export function useGetVitalDetailByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ['vitalDetail', 'visit', visitId],
    queryFn: () => getVitalDetailByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 