import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

const createRole = async (data: any) => {
  try {
    const url = `/api/role`;
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

export const useCreateRole = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      onError?.(error);
    }
  });
};
