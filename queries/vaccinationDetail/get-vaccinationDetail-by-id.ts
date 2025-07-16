import { useQuery } from "@tanstack/react-query";
import { VaccinationDetail } from "./create-vaccinationDetail";

// Function to get a vaccination detail by ID
export const getVaccinationDetailById = async (id: string): Promise<VaccinationDetail | null> => {
  if (!id) return null;
  
  const response = await fetch(`/api/vaccinationDetail/${id}`);
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch vaccination detail');
  }
  
  return await response.json();
};

// Hook for getting a vaccination detail by ID
export const useGetVaccinationDetailById = (id: string) => {
  return useQuery({
    queryKey: ['vaccinationDetail', id],
    queryFn: () => getVaccinationDetailById(id),
    enabled: !!id,
    retry: 1,
  });
};
