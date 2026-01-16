import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlanDetail } from "./get-plan-detail-by-id";

export interface CreatePlanDetailRequest {
  visitId: string;
  notes?: string;
  isCompleted: boolean;
  followUpDate?: Date | null;
  planIds: string[];
}

const createPlanDetail = async (data: CreatePlanDetailRequest): Promise<PlanDetail> => {
  try {
    const response = await fetch('/api/PlanDetail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create plan detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating plan detail:', error);
    throw error;
  }
};

export const useCreatePlanDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: PlanDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlanDetail,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['planDetail'] });
      queryClient.invalidateQueries({ queryKey: ['planDetail', data.id] });
      queryClient.invalidateQueries({ queryKey: ['planDetail', 'visit', data.visitId] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};

export default createPlanDetail; 