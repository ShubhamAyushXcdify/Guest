import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Patient } from "./get-patients";

interface UpdatePatientPayload {
  id: string;
  clientId: string;
  name: string;
  species: string;
  breed: string;
  color: string;
  gender: string;
  isNeutered: boolean;
  dateOfBirth: string;
  weightKg: number;
  microchipNumber?: string;
  registrationNumber?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string;
  medicalConditions?: string;
  behavioralNotes?: string;
  isActive: boolean;
}

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePatientPayload) => {
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
    },
    onSuccess: () => {
      // Invalidate and refetch patients queries
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};
