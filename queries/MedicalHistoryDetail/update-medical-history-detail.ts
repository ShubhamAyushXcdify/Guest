import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MedicalHistoryDetail } from "./get-medical-history-detail-by-id";

interface UpdateMedicalHistoryDetailRequest {
  id: string;
  chronicConditionsNotes?: string;
  surgeriesNotes?: string;
  currentMedicationsNotes?: string;
  generalNotes?: string;
  isCompleted?: boolean;
}

const updateMedicalHistoryDetail = async (
  data: UpdateMedicalHistoryDetailRequest
): Promise<MedicalHistoryDetail> => {
  try {
    if (!data.id) {
      throw new Error("Medical history detail ID is required");
    }

    const response = await fetch(`/api/MedicalHistoryDetail/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update medical history detail");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating medical history detail:", error);
    throw error;
  }
};

export const useUpdateMedicalHistoryDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMedicalHistoryDetail,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["medicalHistoryDetail", data.id] });
      queryClient.invalidateQueries({ queryKey: ["medicalHistoryDetail", "patient", data.patientId] });
    },
  });
};

export default updateMedicalHistoryDetail; 