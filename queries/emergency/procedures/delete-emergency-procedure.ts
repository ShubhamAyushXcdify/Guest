import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteEmergencyProcedure = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("Procedure ID is required");
  }
  const response = await fetch(`/api/emergencyvisit/procedures/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete emergency visit procedure');
  }
};

export const useDeleteEmergencyProcedure = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmergencyProcedure,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyProcedures'] });
      queryClient.invalidateQueries({ queryKey: ['emergencyProcedure', id] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 