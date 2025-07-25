import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteSurgeryPreOp = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("PreOp ID is required");
  }
  const response = await fetch(`/api/surgery/preop/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete surgery preop record');
  }
};

export const useDeleteSurgeryPreOp = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSurgeryPreOp,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryPreOp'] });
      queryClient.invalidateQueries({ queryKey: ['surgeryPreOp', id] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 