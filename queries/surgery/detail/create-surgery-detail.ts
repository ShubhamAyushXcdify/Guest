import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SurgeryDetail } from "./get-surgery-detail";

interface CreateSurgeryDetailData extends Omit<SurgeryDetail, 'id' | 'createdAt' | 'updatedAt'> {}

const createSurgeryDetail = async (data: CreateSurgeryDetailData): Promise<SurgeryDetail> => {
  const response = await fetch('/api/surgery/detail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create surgery detail record');
  }
  return await response.json();
};

export const useCreateSurgeryDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: SurgeryDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSurgeryDetail,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryDetail'] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 