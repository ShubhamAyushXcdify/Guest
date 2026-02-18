import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

const createClinic = async (data: any) => {
  const url = `/api/clinic`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getMessageFromErrorBody(result, 'Failed to create clinic');
    throw new Error(message);
  }
  return result;
};

export const useCreateClinic = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createClinic,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error)
    }
  })
} 