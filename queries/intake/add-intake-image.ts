import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AddIntakeImageParams {
  id: string;
  imagePath: string;
}

interface IntakeImage {
  id: string;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
}

const addIntakeImage = async ({ id, imagePath }: AddIntakeImageParams): Promise<IntakeImage> => {
  try {
    if (!id) {
      throw new Error("Intake detail ID is required");
    }
    
    const response = await fetch(`/api/IntakeDetail/${id}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imagePath),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add image to intake detail');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error adding image to intake detail:", error);
    throw error;
  }
};

export const useAddIntakeImage = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: IntakeImage) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addIntakeImage,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['intake'] });
      queryClient.invalidateQueries({ queryKey: ['intake', 'detail', variables.id] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 