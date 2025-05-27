import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

const createSupplier = async (data: any) => {
  try {
    const url = `/api/supplier`;
    
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

export const useCreateSupplier = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error)
    }
  })
}
