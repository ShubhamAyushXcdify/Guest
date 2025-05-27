import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Patient } from "./get-patients";

interface UpdatePatientRequest extends Partial<Patient> {
  id: string;
}

const updatePatient = async (data: UpdatePatientRequest): Promise<Patient> => {
  const response = await fetch(`/api/patients/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update patient");
  }

  return response.json();
};

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedPatient: UpdatePatientRequest) => updatePatient(updatedPatient),
    onSuccess: (data) => {
      // Invalidate and refetch the patient list
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      // Update the individual patient cache
      queryClient.invalidateQueries({ queryKey: ["patient", data.id] });
    },
  });
}
