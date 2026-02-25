import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteMedicalHistoryDetailRequest {
  id: string;
  patientId?: string;
}

const deleteMedicalHistoryDetail = async (
  data: DeleteMedicalHistoryDetailRequest
): Promise<void> => {
  try {
    if (!data.id) {
      throw new Error("Medical history detail ID is required");
    }

    const response = await fetch(`/api/MedicalHistoryDetail/${data.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete medical history detail");
    }
  } catch (error) {
    console.error("Error deleting medical history detail:", error);
    throw error;
  }
};

export const useDeleteMedicalHistoryDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedicalHistoryDetail,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["medicalHistoryDetail", variables.id] });
      if (variables.patientId) {
        queryClient.invalidateQueries({ queryKey: ["medicalHistoryDetail", "patient", variables.patientId] });
      }
      queryClient.invalidateQueries({ queryKey: ["medicalHistoryDetail"] });
    },
  });
};

export default deleteMedicalHistoryDetail; 