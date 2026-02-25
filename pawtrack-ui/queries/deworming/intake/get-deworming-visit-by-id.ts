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

const getDewormingVisitById = async (id: string): Promise<DewormingVisitDetail> => {
  if (!id) {
    throw new Error('DewormingVisit ID is required');
  }
  
  const response = await fetch(`/api/deworming/intake/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch deworming visit data');
  }
  
  return response.json();
};

export const useGetDewormingVisitById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['dewormingVisit', id],
    queryFn: () => getDewormingVisitById(id),
    enabled: !!id && enabled,
  });
}; 