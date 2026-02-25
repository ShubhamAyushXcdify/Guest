import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteMedicalRecordParams {
  id: string;
  patientId?: string; // Optional, but useful for invalidating queries
}

const deleteMedicalRecord = async ({ id }: DeleteMedicalRecordParams): Promise<void> => {
  try {
    if (!id) {
      throw new Error("Medical record ID is required");
    }
    
    const response = await fetch(`/api/MedicalRecord/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete medical record');
    }
    
    return;
  } catch (error) {
    console.error("Error deleting medical record:", error);
    throw error;
  }
};

export const useDeleteMedicalRecord = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedicalRecord,
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', variables.id] });
      if (variables.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: ['medicalRecords', { patientId: variables.patientId }] 
        });
      }
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 