import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteScreenParams {
  id: string;
}

const deleteScreen = async ({ id }: DeleteScreenParams) => {
  const response = await fetch(`/api/screen/${id}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to delete screen");
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const useDeleteScreen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteScreen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screen"] });
    },
  });
};


