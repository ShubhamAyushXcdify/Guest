import { useQuery } from "@tanstack/react-query";

// Inline type definition to fix linter error
export interface EmergencyVisitDetail {
  id: string;
  arrivalTime: string;
  triageNurseDoctor: string;
  triageCategory: string;
  painScore: number;
  allergies: string;
  immediateInterventionRequired: boolean;
  reasonForEmergency: string;
  triageLevel: string;
  presentingComplaint: string;
  initialNotes: string;
  createdAt: string;
  updatedAt: string;
  visitId: string;
  isComplete: boolean;
}

const getEmergencyVisitByVisitId = async (visitId: string): Promise<EmergencyVisitDetail | null> => {
  if (!visitId) {
    throw new Error('Visit ID is required');
  }
  const response = await fetch(`/api/emergency/triage/visit/${visitId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch emergency triage by visitId');
  }
  const data = await response.json();
  // If the API returns an array, return the first object or null
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }
  return data;
};

export const useGetEmergencyVisitByVisitId = (visitId: string, enabled = true) => {
  return useQuery({
    queryKey: ['emergencyVisitByVisitId', visitId],
    queryFn: () => getEmergencyVisitByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
}; 