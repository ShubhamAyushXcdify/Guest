import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteVitalDetailParams {
  id: string;
  visitId?: string; // For query invalidation
}

const deleteVitalDetail = async ({ id }: DeleteVitalDetailParams): Promise<void> => {
  try {
    if (!id) {
      throw new Error("Vital detail ID is required");
    }
    
    const response = await fetch(`/api/VitalDetail/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete vital detail');
    }
    
  } catch (error) {
    console.error("Error deleting vital detail:", error);
    throw error;
  }
};

export const useDeleteVitalDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVitalDetail,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vitalDetail', variables.id] });
      if (variables.visitId) {
        queryClient.invalidateQueries({ queryKey: ['vitalDetail', 'visit', variables.visitId] });
      }
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 