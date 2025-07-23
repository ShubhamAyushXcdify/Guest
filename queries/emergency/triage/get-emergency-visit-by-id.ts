import { useQuery } from "@tanstack/react-query";

interface EmergencyVisitDetail {
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
}

const getEmergencyVisitById = async (id: string): Promise<EmergencyVisitDetail> => {
  if (!id) {
    throw new Error('EmergencyVisit ID is required');
  }
  
  const response = await fetch(`/api/emergency/triage/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch emergency visit data');
  }
  
  return response.json();
};

export const useGetEmergencyVisitById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['emergencyVisit', id],
    queryFn: () => getEmergencyVisitById(id),
    enabled: !!id && enabled,
  });
}; 