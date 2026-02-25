import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteSurgeryDetail = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("Detail ID is required");
  }
  const response = await fetch(`/api/surgery/detail/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete surgery detail record');
  }
};

export const useDeleteSurgeryDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSurgeryDetail,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryDetail'] });
      queryClient.invalidateQueries({ queryKey: ['surgeryDetail', id] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 