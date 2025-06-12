import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Procedure } from "./get-procedures";

interface CreateProcedureData {
  name: string;
  notes?: string;
}

const createProcedure = async (data: CreateProcedureData): Promise<Procedure> => {
  try {
    const response = await fetch('/api/procedure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create procedure');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating procedure:', error);
    throw error;
  }
};

export const useCreateProcedure = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: Procedure) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProcedure,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 