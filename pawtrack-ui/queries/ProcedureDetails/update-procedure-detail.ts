import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProcedureDetail } from "./get-procedure-detail-by-id";

interface UpdateProcedureDetailData {
  id: string;
  notes?: string;
  isCompleted?: boolean;
  procedureIds?: string[];
}

const updateProcedureDetail = async (data: UpdateProcedureDetailData): Promise<ProcedureDetail> => {
  try {
    const { id, ...updateData } = data;
    
    if (!id) {
      throw new Error("Procedure detail ID is required");
    }
    
    const response = await fetch(`/api/ProcedureDetail/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update procedure detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating procedure detail:', error);
    throw error;
  }
};

export const useUpdateProcedureDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: ProcedureDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProcedureDetail,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['procedureDetail', data.id] });
      queryClient.invalidateQueries({ queryKey: ['procedureDetail', 'visit', data.visitId] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 