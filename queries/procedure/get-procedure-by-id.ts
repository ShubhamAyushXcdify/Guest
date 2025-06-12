import { useQuery } from "@tanstack/react-query";
import { Procedure } from "./get-procedures";

const getProcedureById = async (id: string): Promise<Procedure> => {
  try {
    if (!id) {
      throw new Error("Procedure ID is required");
    }
    
    const response = await fetch(`/api/Procedure/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch procedure");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching procedure by ID:", error);
    throw error;
  }
};

export function useGetProcedureById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['procedure', id],
    queryFn: () => getProcedureById(id),
    enabled: !!id && enabled,
  });
} 