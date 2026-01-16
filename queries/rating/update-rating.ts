import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateRatingInput {
  id: string;
  rating?: number;   // 1–5
  feedback?: string;
}

const updateRating = async ({ id, ...body }: UpdateRatingInput) => {
  const response = await fetch(`/api/Rating/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Failed to update rating");
  }
  return result;
};

export function useUpdateRating(options?: {
  onSuccess?: (data: any, variables: UpdateRatingInput) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRating,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
      queryClient.invalidateQueries({ queryKey: ["rating", variables.id] });
      options?.onSuccess?.(data, variables);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}