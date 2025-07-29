import { useMutation } from "@tanstack/react-query";

export interface UpdateDewormingMedicationDto {
  id: string;
  visitId: string;
  productName?: string;
  batchNumber?: string;
  dose?: string;
  route?: string;
  dateTimeGiven?: string;
  veterinarianName?: string;
  manufacturer?: string;
  expiryDate?: string;
  administeredBy?: string;
  remarks?: string;
  isCompleted?: boolean;
}

const updateDewormingMedication = async (data: UpdateDewormingMedicationDto) => {
  const response = await fetch(`/api/deworming/medication/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update deworming medication');
  }
  return response.json();
};

export const useUpdateDewormingMedication = () => {
  return useMutation({
    mutationFn: updateDewormingMedication,
  });
}; 