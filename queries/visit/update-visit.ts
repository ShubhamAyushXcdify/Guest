import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateVisitData {
  id: string;
  isIntakeCompleted?: boolean;
  isComplaintsCompleted?: boolean;
}

export const useUpdateVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (visitData: UpdateVisitData) => {
      const { id, ...updateData } = visitData;
      
      const response = await fetch(`/api/visit/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update visit');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['visit', variables.id] });
      queryClient.invalidateQueries({ 
        queryKey: ['visit', 'appointment', data.appointmentId] 
      });
    },
  });
};
