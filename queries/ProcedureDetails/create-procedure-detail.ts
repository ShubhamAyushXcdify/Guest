import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProcedureDetail } from "./get-procedure-detail-by-id";

interface CreateProcedureDetailData {
  visitId: string;
  notes?: string;
  isCompleted?: boolean;
  procedureIds?: string[];
}

const createProcedureDetail = async (data: CreateProcedureDetailData): Promise<ProcedureDetail> => {
  try {
    const response = await fetch('/api/ProcedureDetail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create procedure detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating procedure detail:', error);
    throw error;
  }
};

export const useCreateProcedureDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: ProcedureDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProcedureDetail,
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