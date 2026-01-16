import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteRating = async (id: string) => {
  const response = await fetch(`/api/Rating/${id}`, { method: "DELETE" });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete rating");
  }
  return { id };
};

export function useDeleteRating(options?: {
  onSuccess?: (data: { id: string }) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRating,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
      queryClient.removeQueries({ queryKey: ["rating", data.id] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}