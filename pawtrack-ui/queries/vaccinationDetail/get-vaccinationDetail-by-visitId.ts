import { useQuery } from "@tanstack/react-query";
import { VaccinationDetailResponse } from "./create-vaccinationDetail";

// Function to get vaccination details by visit ID
export const getVaccinationDetailsByVisitId = async (visitId: string): Promise<VaccinationDetailResponse[]> => {
  if (!visitId) return [];
  
  try {
    const response = await fetch(`/api/vaccinationDetail/visit/${visitId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch vaccination details for this visit');
    }
    
    const result = await response.json();
    
    // Handle null response (no data found)
    if (result === null) {
      return [];
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching vaccination details:", error);
    throw error;
  }
};

// Hook for getting vaccination details by visit ID
export const useGetVaccinationDetailsByVisitId = (visitId: string) => {
  return useQuery({
    queryKey: ['vaccinationDetails', 'visit', visitId],
    queryFn: () => getVaccinationDetailsByVisitId(visitId),
    enabled: !!visitId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
