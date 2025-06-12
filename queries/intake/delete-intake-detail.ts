import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteIntakeDetail = async (id: string): Promise<void> => {
  try {
    if (!id) {
      throw new Error("Intake ID is required");
    }
    
    const response = await fetch(`/api/intakedetail/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error("Failed to delete intake detail");
    }
    
    return;
  } catch (error) {
    console.error("Error deleting intake detail:", error);
    throw error;
  }
};

export const useDeleteIntakeDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIntakeDetail,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['intake'] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 