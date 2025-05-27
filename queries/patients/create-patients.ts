import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Patient } from "./get-patients";

interface CreatePatientRequest {
  clinicId: string;
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

const createPatient = async (data: CreatePatientRequest): Promise<Patient> => {
  const response = await fetch("/api/patients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create patient");
  }

  return response.json();
};

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPatient: CreatePatientRequest) => createPatient(newPatient),
    onSuccess: () => {
      // Invalidate and refetch the patients list
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
