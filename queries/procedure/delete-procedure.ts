import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteProcedure = async (id: string): Promise<void> => {
  try {
    if (!id) {
      throw new Error("Procedure ID is required");
    }
    
    const response = await fetch(`/api/Procedure/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete procedure');
    }
    
  } catch (error) {
    console.error("Error deleting procedure:", error);
    throw error;
  }
};

export const useDeleteProcedure = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProcedure,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['procedure', id] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 