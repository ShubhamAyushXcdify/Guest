import { useQuery } from "@tanstack/react-query";

export interface DewormingVisitDetail {
  id: string;
  visitId: string;
  weightKg?: number;
  lastDewormingDate?: string;
  symptomsNotes?: string;
  temperatureC?: number;
  appetiteFeedingNotes?: string;
  currentMedications?: string;
  isStoolSampleCollected: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getDewormingVisitByVisitId = async (visitId: string): Promise<DewormingVisitDetail | null> => {
  if (!visitId) {
    throw new Error('Visit ID is required');
  }
  const response = await fetch(`/api/deworming/intake/visit/${visitId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch deworming intake by visitId');
  }
  const data = await response.json();
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }
  return data;
};

export const useGetDewormingVisitByVisitId = (visitId: string, enabled = true) => {
  return useQuery({
    queryKey: ['dewormingVisitByVisitId', visitId],
    queryFn: () => getDewormingVisitByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
}; 