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

const getDewormingVisits = async (pageNumber = 1, pageSize = 10, paginationRequired = true): Promise<DewormingVisitDetail[]> => {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
    paginationRequired: String(paginationRequired),
  });
  const response = await fetch(`/api/deworming/intake?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch deworming visits');
  }
  return response.json();
};

export const useGetDewormingVisits = (pageNumber = 1, pageSize = 10, paginationRequired = true) => {
  return useQuery({
    queryKey: ['dewormingVisits', pageNumber, pageSize, paginationRequired],
    queryFn: () => getDewormingVisits(pageNumber, pageSize, paginationRequired),
  });
}; 