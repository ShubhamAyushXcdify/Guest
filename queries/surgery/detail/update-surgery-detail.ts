import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SurgeryDetail } from "./get-surgery-detail";

interface UpdateSurgeryDetailData extends Partial<Omit<SurgeryDetail, 'createdAt' | 'updatedAt'>> {
  id: string;
}

const updateSurgeryDetail = async (data: UpdateSurgeryDetailData): Promise<SurgeryDetail> => {
  const { id, ...updateData } = data;
  if (!id) {
    throw new Error("Detail ID is required");
  }
  const response = await fetch(`/api/surgery/detail/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update surgery detail record');
  }
  return await response.json();
};

export const useUpdateSurgeryDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: SurgeryDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSurgeryDetail,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryDetail'] });
      queryClient.invalidateQueries({ queryKey: ['surgeryDetail', data.id] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 