import { useQuery } from "@tanstack/react-query";
import { MedicalRecord } from "./get-medical-records";

const getMedicalRecordById = async (id: string): Promise<MedicalRecord> => {
  try {
    if (!id) {
      throw new Error("Medical record ID is required");
    }
    
    const response = await fetch(`/api/MedicalRecord/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch medical record");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching medical record by ID:", error);
    throw error;
  }
};

export function useGetMedicalRecordById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['medicalRecord', id],
    queryFn: () => getMedicalRecordById(id),
    enabled: !!id && enabled,
  });
} 