import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

const deletePatient = async (patientId: string): Promise<void> => {
  const response = await fetch(`/api/patients/${patientId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    const message = getMessageFromErrorBody(result, 'Failed to delete patient');
    throw new Error(message);
  }
};

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId),
    onSuccess: () => {
      // Invalidate and refetch the patients list
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
