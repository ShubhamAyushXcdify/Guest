import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

const createRole = async (data: { name: string; value: string; isPrivileged: boolean; metadata: string; isClinicRequired: boolean; colourName: string; priority: number; }) => {
  const url = `/api/role`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getMessageFromErrorBody(result, 'Failed to create role');
    throw new Error(message);
  }
  return result;
}

export const useCreateRole = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      onError?.(error);
    }
  });
};
