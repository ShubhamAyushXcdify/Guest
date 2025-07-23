import { useQuery } from "@tanstack/react-query";
import { EmergencyVisitVital } from "./get-emergency-vital-by-id";

const getEmergencyVitalByVisitId = async (visitId: string): Promise<EmergencyVisitVital> => {
  if (!visitId) {
    throw new Error("Visit ID is required");
  }
  const response = await fetch(`/api/emergency/vitals/visit/${visitId}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null as any;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch emergency visit vital by visit ID");
  }
  return await response.json();
};

export function useGetEmergencyVitalByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ['emergencyVital', 'visit', visitId],
    queryFn: () => getEmergencyVitalByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 