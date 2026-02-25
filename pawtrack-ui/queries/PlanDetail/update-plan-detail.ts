import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlanDetail } from "./get-plan-detail-by-id";

export interface UpdatePlanDetailRequest {
  id: string;
  notes?: string;
  isCompleted?: boolean;
  followUpDate?: Date | null;
  planIds?: string[];
  visitId?: string;
}

const updatePlanDetail = async (request: UpdatePlanDetailRequest): Promise<PlanDetail> => {
  try {
    const { id } = request;
    
    if (!id) {
      throw new Error("Plan detail ID is required");
    }
    
    const response = await fetch(`/api/PlanDetail/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update plan detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating plan detail:', error);
    throw error;
  }
};

export const useUpdatePlanDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: PlanDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlanDetail,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['planDetail', data.id] });
      if (data.visitId) {
        queryClient.invalidateQueries({ queryKey: ['planDetail', 'visit', data.visitId] });
      }
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};

export default updatePlanDetail; 