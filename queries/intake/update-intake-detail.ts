import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateIntakeDetailRequest, IntakeDetail } from "@/components/appointments/Patient-Information/types/intake";

const updateIntakeDetail = async (request: UpdateIntakeDetailRequest): Promise<IntakeDetail> => {
  try {
    const { id } = request;
    
    if (!id) {
      throw new Error("Intake ID is required");
    }
    
    const response = await fetch(`/api/IntakeDetail/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update intake detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating intake detail:', error);
    throw error;
  }
};

export const useUpdateIntakeDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: IntakeDetail) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIntakeDetail,
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['intake'] });
      queryClient.invalidateQueries({ queryKey: ['intake', 'detail', data.id] });
      queryClient.invalidateQueries({ queryKey: ['intake', data.visitId] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 