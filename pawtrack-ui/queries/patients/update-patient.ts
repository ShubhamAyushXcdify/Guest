import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";
import { Patient } from "./get-patients";

interface UpdatePatientPayload {
  id: string;
  clientId: string;
  name: string;
  species: string;
  breed: string;
  secondaryBreed?: string;
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

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = getMessageFromErrorBody(result, 'Failed to update patient');
        throw new Error(message);
      }

      return result;
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};
