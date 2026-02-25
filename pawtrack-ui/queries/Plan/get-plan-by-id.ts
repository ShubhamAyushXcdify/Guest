import { useQuery } from "@tanstack/react-query";
import { Plan } from "./get-plans";

const getPlanById = async (id: string): Promise<Plan> => {
  try {
    if (!id) {
      throw new Error("Plan ID is required");
    }
    
    const response = await fetch(`/api/Plan/${id}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch plan");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching plan by ID:", error);
    throw error;
  }
};

export const useGetPlanById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: () => getPlanById(id),
    enabled: !!id && enabled,
  });
};

export default getPlanById; 