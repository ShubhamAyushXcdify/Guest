import { useQuery } from "@tanstack/react-query";
import { EmergencyDischarge } from "./get-emergency-discharge-by-id";

const getEmergencyDischargeByVisitId = async (visitId: string): Promise<EmergencyDischarge> => {
  if (!visitId) {
    throw new Error("Visit ID is required");
  }
  const response = await fetch(`/api/emergency/discharge/visit/${visitId}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null as any;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch emergency discharge by visit ID");
  }
  return await response.json();
};

export function useGetEmergencyDischargeByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ['emergencyDischarge', 'visit', visitId],
    queryFn: () => getEmergencyDischargeByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 