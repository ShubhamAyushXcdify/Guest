import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MedicalHistoryDetail } from "./get-medical-history-detail-by-id";

interface CreateMedicalHistoryDetailRequest {
  patientId: string;
  chronicConditionsNotes?: string;
  surgeriesNotes?: string;
  currentMedicationsNotes?: string;
  generalNotes?: string;
  isCompleted?: boolean;
}

const createMedicalHistoryDetail = async (
  data: CreateMedicalHistoryDetailRequest
): Promise<MedicalHistoryDetail> => {
  try {
    const response = await fetch("/api/MedicalHistoryDetail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create medical history detail");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating medical history detail:", error);
    throw error;
  }
};

export const useCreateMedicalHistoryDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMedicalHistoryDetail,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["medicalHistoryDetail"] });
      queryClient.invalidateQueries({ queryKey: ["medicalHistoryDetail", "patient", data.patientId] });
    },
  });
};

export default createMedicalHistoryDetail; 