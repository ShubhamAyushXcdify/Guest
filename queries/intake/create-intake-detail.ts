import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateIntakeDetailRequest, IntakeDetail } from "@/components/appointments/Patient-Information/types/intake";

const createIntakeDetail = async (data: CreateIntakeDetailRequest): Promise<IntakeDetail> => {
  try {
    const response = await fetch('/api/IntakeDetail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create intake detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating intake detail:', error);
    throw error;
  }
};

export const useCreateIntakeDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: IntakeDetail) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIntakeDetail,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['intake'] });
      queryClient.invalidateQueries({ queryKey: ['intake', data.visitId] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 