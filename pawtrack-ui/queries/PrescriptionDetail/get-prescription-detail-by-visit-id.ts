import { useQuery } from "@tanstack/react-query";
import { PrescriptionDetail } from "./get-prescription-detail-by-id";

const getPrescriptionDetailByVisitId = async (visitId: string): Promise<PrescriptionDetail | null> => {
  try {
    if (!visitId) {
      throw new Error("Visit ID is required");
    }
    
    const response = await fetch(`/api/PrescriptionDetail/visit/${visitId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No prescription detail found for this visit - return null instead of throwing
        return null;
      }
      throw new Error("Failed to fetch prescription detail by visit ID");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching prescription detail by visit ID:", error);
    throw error;
  }
};

export const useGetPrescriptionDetailByVisitId = (visitId: string, enabled = true) => {
  return useQuery({
    queryKey: ['prescriptionDetail', 'visit', visitId],
    queryFn: () => getPrescriptionDetailByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
};

export default getPrescriptionDetailByVisitId; 