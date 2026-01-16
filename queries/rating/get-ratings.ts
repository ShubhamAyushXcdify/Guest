import { useQuery } from "@tanstack/react-query";

export interface RatingItem {
  id: string;
  appointmentId: string;
  rating: number;
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getRatings = async (): Promise<RatingItem[]> => {
  const response = await fetch("/api/Rating", { method: "GET" });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch ratings");
  }
  return response.json();
};

export function useGetRatings(enabled = true) {
  return useQuery({
    queryKey: ["ratings"],
    queryFn: getRatings,
    enabled,
  });
}