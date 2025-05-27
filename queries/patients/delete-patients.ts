import { useMutation, useQueryClient } from "@tanstack/react-query";

const deletePatient = async (patientId: string): Promise<void> => {
  const response = await fetch(`/api/patients/${patientId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete patient");
  }

  return;
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
