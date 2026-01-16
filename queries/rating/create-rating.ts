import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateRatingInput {
  appointmentId: string;
  rating: number; // 1–5
  feedback?: string;
}

const createRating = async (data: CreateRatingInput) => {
  const response = await fetch("/api/Rating", {
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

export function useCreateRating(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRating,
    onSuccess: (data) => {
      // Keep consistent invalidations; adjust keys if you split by appointmentId.
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
      if (options?.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      if (options?.onError) options.onError(error);
    },
  });
}