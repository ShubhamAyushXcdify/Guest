import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeletePlanDetailParams {
  id: string;
  visitId?: string;
}

const deletePlanDetail = async ({ id }: DeletePlanDetailParams): Promise<void> => {
  try {
    if (!id) {
      throw new Error("Plan detail ID is required");
    }
    
    const response = await fetch(`/api/PlanDetail/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete plan detail');
    }
    
    return;
  } catch (error) {
    console.error("Error deleting plan detail:", error);
    throw error;
  }
};

export const useDeletePlanDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlanDetail,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['planDetail', variables.id] });
      if (variables.visitId) {
        queryClient.invalidateQueries({ queryKey: ['planDetail', 'visit', variables.visitId] });
      }
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};

export default deletePlanDetail; 