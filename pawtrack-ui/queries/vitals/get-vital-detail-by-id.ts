import { useQuery } from "@tanstack/react-query";
import { VitalDetail } from "./create-vital-detail";

const getVitalDetailById = async (id: string): Promise<VitalDetail> => {
  try {
    if (!id) {
      throw new Error("Vital detail ID is required");
    }
    
    const response = await fetch(`/api/VitalDetail/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch vital detail");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching vital detail by ID:", error);
    throw error;
  }
};

export function useGetVitalDetailById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['vitalDetail', id],
    queryFn: () => getVitalDetailById(id),
    enabled: !!id && enabled,
  });
} 