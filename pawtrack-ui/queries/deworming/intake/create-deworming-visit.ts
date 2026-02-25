import { useMutation } from "@tanstack/react-query";

export interface CreateDewormingVisitDto {
  visitId: string;
  weightKg?: number;
  lastDewormingDate?: string;
  symptomsNotes?: string;
  temperatureC?: number;
  appetiteFeedingNotes?: string;
  currentMedications?: string;
  isStoolSampleCollected: boolean;
  isCompleted: boolean;
}

const createDewormingVisit = async (data: CreateDewormingVisitDto) => {
  const response = await fetch(`/api/deworming/intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create deworming visit');
  }
  return response.json();
};

export const useCreateDewormingVisit = () => {
  return useMutation({
    mutationFn: createDewormingVisit,
  });
}; 