import { useQuery } from "@tanstack/react-query";

export interface DewormingCheckoutDetail {
  id: string;
  visitId: string;
  summary?: string;
  nextDewormingDueDate?: string;
  homeCareInstructions?: string;
  clientAcknowledged: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getDewormingCheckoutByVisitId = async (visitId: string): Promise<DewormingCheckoutDetail[] | null> => {
  if (!visitId) {
    throw new Error('Visit ID is required');
  }
  const response = await fetch(`/api/deworming/checkout/visit/${visitId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch deworming checkout by visitId');
  }
  return response.json();
};

export const useGetDewormingCheckoutByVisitId = (visitId: string, enabled = true) => {
  return useQuery({
    queryKey: ['dewormingCheckoutByVisitId', visitId],
    queryFn: () => getDewormingCheckoutByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
}; 