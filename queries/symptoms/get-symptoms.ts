import { useQuery } from "@tanstack/react-query";

export interface Symptom {
  id: string;
  name: string;
  notes?: string;
  isComman: boolean;
  breed: string;
  createdAt: string;
  updatedAt: string;
}

interface GetSymptomsParams {
  breed?: string;
}

const getSymptoms = async (params?: GetSymptomsParams): Promise<Symptom[]> => {
  try {
    const url = new URL('/api/Symptom', window.location.origin);
    
    if (params?.breed) {
      url.searchParams.append('breed', params.breed);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch symptoms");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    throw error;
  }
};

export function useGetSymptoms(params?: GetSymptomsParams, enabled = true) {
  return useQuery({
    queryKey: ['symptoms', params],
    queryFn: () => getSymptoms(params),
    enabled,
  });
} 