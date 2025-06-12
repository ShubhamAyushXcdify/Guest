import { useQuery } from "@tanstack/react-query";

// Define the procedure interface based on the API response
interface Procedure {
  id: string;
  name: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Define the ProcedureDetail interface based on the API response
export interface ProcedureDetail {
  id: string;
  visitId: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  procedures: Procedure[];
}

const getProcedureDetailById = async (id: string): Promise<ProcedureDetail> => {
  try {
    if (!id) {
      throw new Error("Procedure detail ID is required");
    }
    
    const response = await fetch(`/api/ProcedureDetail/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch procedure detail");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching procedure detail by ID:", error);
    throw error;
  }
};

export function useGetProcedureDetailById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['procedureDetail', id],
    queryFn: () => getProcedureDetailById(id),
    enabled: !!id && enabled,
  });
} 