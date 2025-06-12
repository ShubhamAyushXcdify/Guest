import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteVisit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (visitId: string) => {
      const response = await fetch(`/api/visit/${visitId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete visit');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
};
