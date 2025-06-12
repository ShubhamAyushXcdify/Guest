import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plan } from "./get-plans";

interface UpdatePlanData {
  id: string;
  name?: string;
  notes?: string;
}

const updatePlan = async (data: UpdatePlanData): Promise<Plan> => {
  try {
    const { id, ...updateData } = data;
    
    if (!id) {
      throw new Error("Plan ID is required");
    }
    
    const response = await fetch(`/api/Plan/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
};

export const useUpdatePlan = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: Plan) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlan,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plan', data.id] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};

export default updatePlan; 