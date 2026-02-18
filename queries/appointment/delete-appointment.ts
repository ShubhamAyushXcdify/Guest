import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

const deleteAppointment = async (id: string) => {
  const url = `/api/appointment/${id}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getMessageFromErrorBody(result, 'Failed to delete appointment');
    throw new Error(message);
  }
  return result;
}

export const useDeleteAppointment = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAppointment,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error)
    }
  })
}