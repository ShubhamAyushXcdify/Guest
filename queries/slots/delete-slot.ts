import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Slot } from "./get-slot-by-roomId";

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDeleteSlot = ({ onSuccess, onError }: MutationOptions = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (slotId: string) => {
      const response = await fetch(`/api/slots/${slotId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete slot');
      }
    },
    onSuccess: () => {
      // We'll invalidate all slots queries since we don't know which room this was for
      queryClient.invalidateQueries({
        queryKey: ['slots'],
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error);
      }
    },
  });
};
