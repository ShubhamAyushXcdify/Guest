import { useQuery } from "@tanstack/react-query";

export interface VaccinationJsonResponse {
  visitId: string;
  vaccinationMasterId: string;
  vaccinationJson: string;
  // Add more fields if the API returns them
}

// Function to get vaccination JSON by visitId and vaccinationMasterId
export const getVaccinationJsonByIds = async (
  visitId: string,
  vaccinationMasterId: string
): Promise<VaccinationJsonResponse | null> => {
  if (!visitId || !vaccinationMasterId) return null;

  try {
    const params = new URLSearchParams({ visitId, vaccinationMasterId });
    const response = await fetch(`/api/vaccinationDetail/by-visit-master?${params.toString()}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch vaccination JSON");
    }

    const result = await response.json();
    
    // Handle null response (no data found)
    if (result === null) {
      return null;
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching vaccination JSON:", error);
    throw error;
  }
};

// Hook for getting vaccination JSON by visitId and vaccinationMasterId
export const useGetVaccinationJsonByIds = (
  visitId: string,
  vaccinationMasterId: string
) => {
  return useQuery({
    queryKey: ["vaccinationJson", visitId, vaccinationMasterId],
    queryFn: () => getVaccinationJsonByIds(visitId, vaccinationMasterId),
    enabled: !!visitId && !!vaccinationMasterId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
