import { useQuery } from "@tanstack/react-query";
import { ProcedureDetail } from "./get-procedure-detail-by-id";

const getProcedureDetailByVisitId = async (visitId: string): Promise<ProcedureDetail | null> => {
  try {
    if (!visitId) {
      throw new Error("Visit ID is required");
    }
    
    const response = await fetch(`/api/ProcedureDetail/visit/${visitId}`);
    
    if (response.status === 404) {
      return null; // Return null for no procedure detail found
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch procedure detail by visit ID");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching procedure detail by visit ID:", error);
    throw error;
  }
};

export function useGetProcedureDetailByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ['procedureDetail', 'visit', visitId],
    queryFn: () => getProcedureDetailByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 