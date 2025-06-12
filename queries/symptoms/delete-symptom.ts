import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteSymptom = async (id: string): Promise<void> => {
  try {
    if (!id) {
      throw new Error("Symptom ID is required");
    }
    
    const response = await fetch(`/api/Symptom/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete symptom');
    }
    
  } catch (error) {
    console.error("Error deleting symptom:", error);
    throw error;
  }
};

export const useDeleteSymptom = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSymptom,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      queryClient.invalidateQueries({ queryKey: ['symptom', id] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 