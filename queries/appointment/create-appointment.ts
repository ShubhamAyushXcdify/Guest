import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

const createAppointment = async (data: any) => {
  const url = `/api/appointment`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getMessageFromErrorBody(result, 'Failed to create appointment');
    throw new Error(message);
  }
  return result;
};

export const useCreateAppointment = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createAppointment,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment'] })
      queryClient.invalidateQueries({ queryKey: ['patient'] })
      queryClient.invalidateQueries({ queryKey: ['appointmentList'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })

      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error)
    }
  })
} 