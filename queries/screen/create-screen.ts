import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

interface CreateScreenData {
  name: string;
  description: string;
}

const createScreen = async (data: CreateScreenData) => {
  const response = await fetch(`/api/screen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getMessageFromErrorBody(result, "Failed to create screen");
    throw new Error(message);
  }
  return result;
};

export const useCreateScreen = ({ onSuccess, onError }: { onSuccess?: () => void; onError?: (error: any) => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createScreen,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screen"] });
      onSuccess?.();
    },
    onError: (error: any) => onError?.(error),
  });
};


