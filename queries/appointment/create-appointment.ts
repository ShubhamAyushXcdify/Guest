import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

const createAppointment = async (data: any) => {
  try {
    const url = `/api/appointment`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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

export const useCreateAppointment = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error)
    }
  })
} 