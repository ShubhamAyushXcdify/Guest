import { useQuery } from "@tanstack/react-query";

export interface MedicalHistoryDetail {
  id: string;
  patientId: string;
  chronicConditionsNotes: string;
  surgeriesNotes: string;
  currentMedicationsNotes: string;
  generalNotes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getMedicalHistoryDetailById = async (id: string): Promise<MedicalHistoryDetail> => {
  try {
    if (!id) {
      throw new Error("Medical history detail ID is required");
    }
    
    const response = await fetch(`/api/MedicalHistoryDetail/${id}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch medical history detail");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching medical history detail by ID:", error);
    throw error;
  }
};

export const useGetMedicalHistoryDetailById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['medicalHistoryDetail', id],
    queryFn: () => getMedicalHistoryDetailById(id),
    enabled: !!id && enabled,
  });
};

export default getMedicalHistoryDetailById; 