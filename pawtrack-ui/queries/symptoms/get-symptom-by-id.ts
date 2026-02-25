import { useQuery } from "@tanstack/react-query";
import { Symptom } from "./get-symptoms";

const getSymptomById = async (id: string): Promise<Symptom> => {
  try {
    if (!id) {
      throw new Error("Symptom ID is required");
    }
    
    const response = await fetch(`/api/Symptom/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch symptom");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching symptom by ID:", error);
    throw error;
  }
};

export function useGetSymptomById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['symptom', id],
    queryFn: () => getSymptomById(id),
    enabled: !!id && enabled,
  });
} 