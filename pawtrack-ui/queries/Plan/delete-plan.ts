import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeletePlanParams {
  id: string;
}

const deletePlan = async ({ id }: DeletePlanParams): Promise<void> => {
  try {
    if (!id) {
      throw new Error("Plan ID is required");
    }
    
    const response = await fetch(`/api/Plan/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete plan');
    }
    
    return;
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
};

export const useDeletePlan = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlan,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plan', variables.id] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};

export default deletePlan; 