import { useQuery } from "@tanstack/react-query";
import { MedicalHistoryDetail } from "./get-medical-history-detail-by-id";

const getMedicalHistoryDetailByVisitId = async (visitId: string): Promise<MedicalHistoryDetail> => {
  try {
    if (!visitId) {
      throw new Error("Visit ID is required");
    }
    
    const response = await fetch(`/api/MedicalHistoryDetail/visit/${visitId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch medical history detail by visit ID");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching medical history detail by visit ID:", error);
    throw error;
  }
};

export const useGetMedicalHistoryDetailByVisitId = (visitId: string, enabled = true) => {
  return useQuery({
    queryKey: ['medicalHistoryDetail', 'visit', visitId],
    queryFn: () => getMedicalHistoryDetailByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
};

export default getMedicalHistoryDetailByVisitId; 