import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteEmergencyVitalParams {
  id: string;
  visitId?: string; // For query invalidation
}

const deleteEmergencyVital = async ({ id }: DeleteEmergencyVitalParams): Promise<void> => {
  if (!id) {
    throw new Error("Vital detail ID is required");
  }
  const response = await fetch(`/api/emergency/vitals/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete emergency visit vital');
  }
};

export const useDeleteEmergencyVital = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmergencyVital,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyVital', variables.id] });
      if (variables.visitId) {
        queryClient.invalidateQueries({ queryKey: ['emergencyVital', 'visit', variables.visitId] });
      }
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 