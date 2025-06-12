import { useQuery } from "@tanstack/react-query";

export interface Procedure {
  id: string;
  name: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const getProcedures = async (): Promise<Procedure[]> => {
  try {
    const response = await fetch('/api/procedure');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch procedures");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching procedures:", error);
    throw error;
  }
};

export function useGetProcedures(enabled = true) {
  return useQuery({
    queryKey: ['procedures'],
    queryFn: getProcedures,
    enabled,
  });
} 