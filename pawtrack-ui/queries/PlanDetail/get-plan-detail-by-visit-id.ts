import { useQuery } from "@tanstack/react-query";
import { PlanDetail } from "./get-plan-detail-by-id";

const getPlanDetailByVisitId = async (visitId: string): Promise<PlanDetail | null> => {
  try {
    if (!visitId) {
      throw new Error("Visit ID is required");
    }
    
    const response = await fetch(`/api/PlanDetail/visit/${visitId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No plan detail found for this visit - return null instead of throwing
        return null;
      }
      throw new Error("Failed to fetch plan detail by visit ID");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching plan detail by visit ID:", error);
    throw error;
  }
};

export const useGetPlanDetailByVisitId = (visitId: string, enabled = true) => {
  return useQuery({
    queryKey: ['planDetail', 'visit', visitId],
    queryFn: () => getPlanDetailByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
};

export default getPlanDetailByVisitId; 