import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Symptom } from "./get-symptoms";

interface CreateSymptomData {
  name: string;
  notes?: string;
}

const createSymptom = async (data: CreateSymptomData): Promise<Symptom> => {
  try {
    const response = await fetch('/api/Symptom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create symptom');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating symptom:', error);
    throw error;
  }
};

export const useCreateSymptom = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: Symptom) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSymptom,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 