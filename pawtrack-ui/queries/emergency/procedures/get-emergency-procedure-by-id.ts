import { useQuery } from "@tanstack/react-query";
import { EmergencyVisitProcedure } from "./get-emergency-procedures";

const getEmergencyProcedureById = async (id: string): Promise<EmergencyVisitProcedure> => {
  if (!id) {
    throw new Error("Procedure ID is required");
  }
  const response = await fetch(`/api/emergencyvisit/procedures/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch emergency visit procedure");
  }
  return await response.json();
};

export function useGetEmergencyProcedureById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['emergencyProcedure', id],
    queryFn: () => getEmergencyProcedureById(id),
    enabled: !!id && enabled,
  });
} 