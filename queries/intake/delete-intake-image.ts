import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteIntakeImageParams {
  imageId: string;
  intakeDetailId?: string; // Optional, but useful for invalidating queries
}

const deleteIntakeImage = async ({ imageId }: DeleteIntakeImageParams): Promise<void> => {
  try {
    if (!imageId) {
      throw new Error("Image ID is required");
    }
    
    const response = await fetch(`/api/IntakeDetail/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete intake image');
    }
    
    return;
  } catch (error) {
    console.error("Error deleting intake image:", error);
    throw error;
  }
};

export const useDeleteIntakeImage = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIntakeImage,
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['intake'] });
      if (variables.intakeDetailId) {
        queryClient.invalidateQueries({ 
          queryKey: ['intake', 'detail', variables.intakeDetailId] 
        });
      }
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};