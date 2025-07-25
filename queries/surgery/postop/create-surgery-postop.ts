import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SurgeryPostOp } from "./get-surgery-postop";

interface CreateSurgeryPostOpData extends Omit<SurgeryPostOp, 'id' | 'createdAt' | 'updatedAt'> {}

const createSurgeryPostOp = async (data: CreateSurgeryPostOpData): Promise<SurgeryPostOp> => {
  const response = await fetch('/api/surgery/postop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create surgery postop record');
  }
  return await response.json();
};

export const useCreateSurgeryPostOp = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: SurgeryPostOp) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSurgeryPostOp,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryPostOp'] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 