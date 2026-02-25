import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteSurgeryPostOp = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("PostOp ID is required");
  }
  const response = await fetch(`/api/surgery/postop/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete surgery postop record');
  }
};

export const useDeleteSurgeryPostOp = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSurgeryPostOp,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryPostOp'] });
      queryClient.invalidateQueries({ queryKey: ['surgeryPostOp', id] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 