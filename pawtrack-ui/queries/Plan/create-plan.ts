import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plan } from "./get-plans";

interface CreatePlanData {
  name: string;
  notes?: string;
}

const createPlan = async (data: CreatePlanData): Promise<Plan> => {
  try {
    const response = await fetch('/api/Plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
};

export const useCreatePlan = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: Plan) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlan,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });

      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};

export default createPlan; 