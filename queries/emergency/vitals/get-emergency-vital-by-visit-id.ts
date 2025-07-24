import { useQuery } from "@tanstack/react-query";
import { EmergencyVisitVital } from "./get-emergency-vital-by-id";

const getEmergencyVitalByVisitId = async (visitId: string): Promise<EmergencyVisitVital | null> => {
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
  const data = await response.json();
  // If the API returns an array, return the first object or null
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }
  return data;
};

export function useGetEmergencyVitalByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ['emergencyVital', 'visit', visitId],
    queryFn: () => getEmergencyVitalByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 