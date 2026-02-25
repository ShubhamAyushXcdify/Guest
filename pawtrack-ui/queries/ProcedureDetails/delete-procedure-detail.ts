import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteProcedureDetailParams {
  id: string;
  visitId?: string; // Optional, for cache invalidation
}

const deleteProcedureDetail = async ({ id }: DeleteProcedureDetailParams): Promise<void> => {
  try {
    if (!id) {
      throw new Error("Procedure detail ID is required");
    }
    
    const response = await fetch(`/api/ProcedureDetail/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete procedure detail');
    }
    
  } catch (error) {
    console.error("Error deleting procedure detail:", error);
    throw error;
  }
};

export const useDeleteProcedureDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProcedureDetail,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['procedureDetail', variables.id] });
      if (variables.visitId) {
        queryClient.invalidateQueries({ queryKey: ['procedureDetail', 'visit', variables.visitId] });
      }
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 