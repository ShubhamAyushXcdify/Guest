import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteIntakeFileParams {
  fileId: string;
  intakeDetailId?: string; // Optional, but useful for invalidating queries
}

const deleteIntakeFile = async ({ fileId }: DeleteIntakeFileParams): Promise<void> => {
  try {
    if (!fileId) {
      throw new Error("File ID is required");
    }
    
    const response = await fetch(`/api/IntakeDetail/file/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete intake file');
    }
    
    return;
  } catch (error) {
    console.error("Error deleting intake file:", error);
    throw error;
  }
};

export const useDeleteIntakeFile = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIntakeFile,
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