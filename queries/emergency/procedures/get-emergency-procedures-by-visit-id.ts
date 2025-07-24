import { useQuery } from "@tanstack/react-query";
import { EmergencyVisitProcedure } from "./get-emergency-procedures";

const getEmergencyProceduresByVisitId = async (visitId: string): Promise<EmergencyVisitProcedure[]> => {
  if (!visitId) {
    throw new Error("visitId is required");
  }
  const response = await fetch(`/api/emergency/procedure/visit/${visitId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch emergency procedures by visitId");
  }
  return await response.json();
};

export function useGetEmergencyProceduresByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ["emergencyProceduresByVisitId", visitId],
    queryFn: () => getEmergencyProceduresByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 