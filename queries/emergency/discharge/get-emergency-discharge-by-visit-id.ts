import { useQuery } from "@tanstack/react-query";

export interface EmergencyDischarge {
  id: string;
  visitId: string;
  dischargeStatus: string;
  dischargeTime: string;
  responsibleClinician: string;
  dischargeSummary: string;
  homeCareInstructions: string;
  followupInstructions: string;
  followupDate?: string;
  reviewedWithClient: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getEmergencyDischargeByVisitId = async (visitId: string): Promise<EmergencyDischarge | null> => {
  if (!visitId) {
    throw new Error("Visit ID is required");
  }
  
  const response = await fetch(`/api/emergency/discharge/visit/${visitId}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch emergency discharge by visit ID");
  }
  
  const data = await response.json();
  
  // Handle case where the API returns an empty array
  if (Array.isArray(data)) {
    return data[0] || null;
  }
  
  return data || null;
};

export function useGetEmergencyDischargeByVisitId(visitId: string, enabled = true) {
  return useQuery<EmergencyDischarge | null, Error>({
    queryKey: ['emergencyDischarge', 'visit', visitId],
    queryFn: () => getEmergencyDischargeByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
}