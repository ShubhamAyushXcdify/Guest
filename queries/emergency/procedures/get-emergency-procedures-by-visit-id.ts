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
  const data = await response.json();
  // If the API returns an array, return it. If it returns an object, wrap it in an array. If null/undefined, return empty array.
  if (Array.isArray(data)) {
    return data;
  } else if (data) {
    return [data];
  } else {
    return [];
  }
};

export function useGetEmergencyProceduresByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ["emergencyProceduresByVisitId", visitId],
    queryFn: () => getEmergencyProceduresByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 