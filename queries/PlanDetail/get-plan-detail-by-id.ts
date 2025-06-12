import { useQuery } from "@tanstack/react-query";

export interface PlanDetail {
  id: string;
  visitId: string;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  plans: {
    id: string;
    name: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

const getPlanDetailById = async (id: string): Promise<PlanDetail> => {
  try {
    if (!id) {
      throw new Error("Plan detail ID is required");
    }
    
    const response = await fetch(`/api/PlanDetail/${id}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch plan detail");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching plan detail by ID:", error);
    throw error;
  }
};

export const useGetPlanDetailById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['planDetail', id],
    queryFn: () => getPlanDetailById(id),
    enabled: !!id && enabled,
  });
};

export default getPlanDetailById; 