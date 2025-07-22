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

  const params = new URLSearchParams({ visitId, vaccinationMasterId });
  const response = await fetch(`/api/vaccinationDetail/by-visit-master?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch vaccination JSON");
  }

  return await response.json();
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
  });
};
