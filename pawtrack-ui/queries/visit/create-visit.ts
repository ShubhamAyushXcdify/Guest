import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateVisitData {
  appointmentId: string;
  patientId: string;
  isIntakeCompleted?: boolean;
  isComplaintsCompleted?: boolean;
}

export const useCreateVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (visitData: CreateVisitData) => {
      const response = await fetch('/api/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create visit');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
};
