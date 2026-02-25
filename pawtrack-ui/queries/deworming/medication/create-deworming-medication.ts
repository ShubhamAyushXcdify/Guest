import { useMutation } from "@tanstack/react-query";

export interface CreateDewormingMedicationDto {
  visitId: string;
  route?: string;
  dateTimeGiven?: string;
  veterinarianName?: string;
  administeredBy?: string;
  remarks?: string;
  isCompleted?: boolean;
}

const createDewormingMedication = async (data: CreateDewormingMedicationDto) => {
  const response = await fetch(`/api/deworming/medication`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create deworming medication');
  }
  return response.json();
};

export const useCreateDewormingMedication = () => {
  return useMutation({
    mutationFn: createDewormingMedication,
  });
}; 