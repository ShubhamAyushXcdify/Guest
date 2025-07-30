import { useQuery } from "@tanstack/react-query";
import { MedicalHistoryDetail } from "./get-medical-history-detail-by-id";

const getMedicalHistoryDetailByPatientId = async (patientId: string): Promise<MedicalHistoryDetail | null> => {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }
    
    const response = await fetch(`/api/MedicalHistoryDetail/patient/${patientId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Return null if not found
      }
      throw new Error("Failed to fetch medical history detail by patient ID");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching medical history detail by patient ID:", error);
    throw error;
  }
};

export const useGetMedicalHistoryDetailByPatientId = (patientId: string, enabled = true) => {
  return useQuery({
    queryKey: ['medicalHistoryDetail', 'patient', patientId],
    queryFn: () => getMedicalHistoryDetailByPatientId(patientId),
    enabled: !!patientId && enabled,
  });
};

export default getMedicalHistoryDetailByPatientId; 