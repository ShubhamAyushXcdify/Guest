import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

const deleteAppointment = async (id: string) => {
  try {
    const url = `/api/appointment/${id}`;
    
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

export const useDeleteAppointment = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error)
    }
  })
} 