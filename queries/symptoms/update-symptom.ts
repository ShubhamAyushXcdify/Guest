import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Symptom } from "./get-symptoms";

interface UpdateSymptomData {
  id: string;
  name?: string;
  notes?: string;
}

const updateSymptom = async (data: UpdateSymptomData): Promise<Symptom> => {
  try {
    const { id, ...updateData } = data;
    
    if (!id) {
      throw new Error("Symptom ID is required");
    }
    
    const response = await fetch(`/api/Symptom/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update symptom');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating symptom:', error);
    throw error;
  }
};

export const useUpdateSymptom = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: Symptom) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSymptom,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      queryClient.invalidateQueries({ queryKey: ['symptom', data.id] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 