import { useMutation } from "@tanstack/react-query";

export interface UpdateDewormingVisitDto {
  id: string;
  weightKg?: number;
  lastDewormingDate?: string;
  symptomsNotes?: string;
  temperatureC?: number;
  appetiteFeedingNotes?: string;
  currentMedications?: string;
  isStoolSampleCollected: boolean;
  isCompleted: boolean;
}

const updateDewormingVisit = async (data: UpdateDewormingVisitDto) => {
  const response = await fetch(`/api/deworming/intake/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update deworming visit');
  }
  return response.json();
};

export const useUpdateDewormingVisit = () => {
  return useMutation({
    mutationFn: updateDewormingVisit,
  });
}; 