import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
};

export const useCreateScreen = ({ onSuccess, onError }: { onSuccess?: () => void; onError?: (error: any) => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createScreen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screen"] });
      onSuccess?.();
    },
    onError: (error: any) => onError?.(error),
  });
};


