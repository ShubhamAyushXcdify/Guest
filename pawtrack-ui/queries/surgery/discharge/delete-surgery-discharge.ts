import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteSurgeryDischarge = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("Discharge ID is required");
  }
  const response = await fetch(`/api/surgery/discharge/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete surgery discharge record');
  }
};

export const useDeleteSurgeryDischarge = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSurgeryDischarge,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryDischarge'] });
      queryClient.invalidateQueries({ queryKey: ['surgeryDischarge', id] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 