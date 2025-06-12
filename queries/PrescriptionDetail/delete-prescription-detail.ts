import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeletePrescriptionDetailParams {
  id: string;
  visitId?: string;
}

const deletePrescriptionDetail = async ({ id }: DeletePrescriptionDetailParams): Promise<void> => {
  try {
    if (!id) {
      throw new Error("Prescription detail ID is required");
    }
    
    const response = await fetch(`/api/PrescriptionDetail/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete prescription detail');
    }
    
    return;
  } catch (error) {
    console.error("Error deleting prescription detail:", error);
    throw error;
  }
};

export const useDeletePrescriptionDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePrescriptionDetail,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptionDetail', variables.id] });
      if (variables.visitId) {
        queryClient.invalidateQueries({ queryKey: ['prescriptionDetail', 'visit', variables.visitId] });
      }
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};

export default deletePrescriptionDetail; 