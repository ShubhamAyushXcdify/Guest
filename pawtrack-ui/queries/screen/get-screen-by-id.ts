import { useQuery } from "@tanstack/react-query";
import type { Screen } from "./get-screen";

const getScreenById = async (id: string) => {
  const response = await fetch(`/api/screen/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch screen by id");
  }
  const result: Screen = await response.json();
  return result;
};

export const useGetScreenById = (id: string | null, enabled = true) =>
  useQuery({
    queryKey: ["screen", id],
    queryFn: async () => {
      if (!id) throw new Error("id is required");
      return getScreenById(id);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    enabled: !!id && enabled,
  });


