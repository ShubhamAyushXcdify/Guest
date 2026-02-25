import { useQuery } from "@tanstack/react-query";
import { SurgeryDischarge } from "./get-surgery-discharge";

const getSurgeryDischargeByVisitId = async (visitId: string): Promise<SurgeryDischarge[]> => {
  try {
    if (!visitId) {
      throw new Error("visitId is required");
    }
    
    const response = await fetch(`/api/surgery/discharge/visit/${visitId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No surgery discharge found for this visit - return empty array instead of throwing
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch surgery discharge by visitId");
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
    console.error("Error fetching surgery discharge by visit ID:", error);
    throw error;
  }
};

export function useGetSurgeryDischargeByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ["surgeryDischargeByVisitId", visitId],
    queryFn: () => getSurgeryDischargeByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 