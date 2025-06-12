import { useQuery } from "@tanstack/react-query";

export interface Symptom {
  id: string;
  name: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const getSymptoms = async (): Promise<Symptom[]> => {
  try {
    const response = await fetch('/api/Symptom');
    
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

export function useGetSymptoms(enabled = true) {
  return useQuery({
    queryKey: ['symptoms'],
    queryFn: getSymptoms,
    enabled,
  });
} 