import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateEmergencyVisitData {
  id: string;
  arrivalTime?: string;
  triageNurseDoctor?: string;
  triageCategory?: string;
  painScore?: number;
  allergies?: string;
  immediateInterventionRequired?: boolean;
  reasonForEmergency?: string;
  triageLevel?: string | null;
  presentingComplaint?: string;
  initialNotes?: string;
  visitId?: string;
  isComplete?: boolean;
}

export const useUpdateEmergencyVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitData: UpdateEmergencyVisitData) => {
      const { id, ...updateData } = visitData;

      const response = await fetch(`/api/emergency/triage/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // ✅ Pass backend message to frontend
        throw { response: { data: errorData }, message: errorData.message || 'Failed to create emergency visit' };
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyVisits'] });
      queryClient.invalidateQueries({ queryKey: ['emergencyVisit', variables.id] });
    },
  });
};

