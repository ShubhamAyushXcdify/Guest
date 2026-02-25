import { useQuery } from "@tanstack/react-query";

export interface RatingItem {
  id: string;
  appointmentId: string;
  rating: number;
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getRatingById = async (id?: string): Promise<RatingItem | null> => {
  if (!id) return null;

  const response = await fetch(`/api/Rating/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch rating by ID");
  }

  return response.json();
};

export function useGetRatingById(id?: string, enabled = true) {
  return useQuery<RatingItem | null>({
    queryKey: ["rating", id],
    queryFn: () => getRatingById(id),
    enabled: enabled && !!id,
  });
}