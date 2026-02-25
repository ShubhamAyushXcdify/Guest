import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateScreenData {
  id: string;
  name: string;
  description: string;
}

const updateScreen = async ({ id, ...data }: UpdateScreenData) => {
  const response = await fetch(`/api/screen/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw err ?? new Error("Failed to update screen");
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const useUpdateScreen = ({ onSuccess, onError }: { onSuccess?: () => void; onError?: (error: any) => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateScreen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screen"] });
      onSuccess?.();
    },
    onError: (error: any) => onError?.(error),
  });
};


