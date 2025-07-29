import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SurgeryPreOp } from "./get-surgery-preop";

interface CreateSurgeryPreOpData extends Omit<SurgeryPreOp, 'id' | 'createdAt' | 'updatedAt'> {}

const createSurgeryPreOp = async (data: CreateSurgeryPreOpData): Promise<SurgeryPreOp> => {
  const response = await fetch('/api/surgery/preop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create surgery preop record');
  }
  return await response.json();
};

export const useCreateSurgeryPreOp = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: SurgeryPreOp) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSurgeryPreOp,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryPreOp'] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 