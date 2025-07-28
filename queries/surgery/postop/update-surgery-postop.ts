import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SurgeryPostOp } from "./get-surgery-postop";

interface UpdateSurgeryPostOpData extends Partial<Omit<SurgeryPostOp, 'createdAt' | 'updatedAt'>> {
  id: string;
}

const updateSurgeryPostOp = async (data: UpdateSurgeryPostOpData): Promise<SurgeryPostOp> => {
  const { id,  } = data;
  if (!id) {
    throw new Error("PostOp ID is required");
  }
  const response = await fetch(`/api/surgery/postop/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update surgery postop record');
  }
  return await response.json();
};

export const useUpdateSurgeryPostOp = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: SurgeryPostOp) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSurgeryPostOp,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryPostOp'] });
      queryClient.invalidateQueries({ queryKey: ['surgeryPostOp', data.id] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 