import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateEmergencyVisitData {
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
  visitId: string;
  isComplete?: boolean;
}

export const useCreateEmergencyVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (visitData: CreateEmergencyVisitData) => {
      const response = await fetch('/api/emergency/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create emergency visit');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['emergencyVisits'] });
    },
  });
}; 