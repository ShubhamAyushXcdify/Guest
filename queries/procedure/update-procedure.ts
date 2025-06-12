import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Procedure } from "./get-procedures";

interface UpdateProcedureData {
  id: string;
  name?: string;
  notes?: string;
}

const updateProcedure = async (data: UpdateProcedureData): Promise<Procedure> => {
  try {
    const { id, ...updateData } = data;
    
    if (!id) {
      throw new Error("Procedure ID is required");
    }
    
    const response = await fetch(`/api/Procedure/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update procedure');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating procedure:', error);
    throw error;
  }
};

export const useUpdateProcedure = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: Procedure) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProcedure,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['procedure', data.id] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 