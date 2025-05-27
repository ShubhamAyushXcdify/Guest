import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

const deleteRoom = async (id: string) => {
  try {
    const url = `/api/room/${id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  } catch (error) {
    throw error;
  }
}

export const useDeleteRoom = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error)
    }
  })
}
