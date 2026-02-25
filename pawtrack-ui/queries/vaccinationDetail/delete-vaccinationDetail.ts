import { useMutation, useQueryClient } from "@tanstack/react-query";

// Function to delete a vaccination detail by ID
const deleteVaccinationDetail = async (id: string): Promise<void> => {
  const response = await fetch(`/api/vaccinationDetail/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete vaccination detail');
  }
};

// Hook for deleting a vaccination detail
export const useDeleteVaccinationDetail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteVaccinationDetail,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['vaccinationDetails'] });
    },
    onError: (error) => {
      console.error('Error deleting vaccination detail:', error);
    },
  });
};
