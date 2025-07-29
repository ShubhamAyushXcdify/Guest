import { useQuery } from "@tanstack/react-query";
import { VaccinationDetailResponse } from "./create-vaccinationDetail";

// Function to get vaccination details by visit ID
export const getVaccinationDetailsByVisitId = async (visitId: string): Promise<VaccinationDetailResponse[]> => {
  if (!visitId) return [];
  
  const response = await fetch(`/api/vaccinationDetail/visit/${visitId}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch vaccination details for this visit');
  }
  
  return await response.json();
};

// Hook for getting vaccination details by visit ID
export const useGetVaccinationDetailsByVisitId = (visitId: string) => {
  return useQuery({
    queryKey: ['vaccinationDetails', 'visit', visitId],
    queryFn: () => getVaccinationDetailsByVisitId(visitId),
    enabled: !!visitId,
    retry: 1,
  });
};
