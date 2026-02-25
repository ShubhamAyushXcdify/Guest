import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SurgeryPreOp } from "./get-surgery-preop";

interface UpdateSurgeryPreOpData extends Partial<Omit<SurgeryPreOp, 'createdAt' | 'updatedAt'>> {
  id: string;
}

const updateSurgeryPreOp = async (data: UpdateSurgeryPreOpData): Promise<SurgeryPreOp> => {
  const { id} = data;
  if (!id) {
    throw new Error("PreOp ID is required");
  }
  const response = await fetch(`/api/surgery/preop/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update surgery preop record');
  }
  return await response.json();
};

export const useUpdateSurgeryPreOp = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: SurgeryPreOp) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSurgeryPreOp,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryPreOp'] });
      queryClient.invalidateQueries({ queryKey: ['surgeryPreOp', data.id] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 