import { useQuery, keepPreviousData } from "@tanstack/react-query";

export type Screen = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

interface ScreenPagedResponse {
  data: Screen[];
  totalPages?: number;
}

const getScreen = async (pageNumber = 1, pageSize = 10, search = "") => {
  const response = await fetch(`/api/screen?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch screen data");
  }
  const result: ScreenPagedResponse = await response.json();
  return result;
};

export const useGetScreen = (
  pageNumber = 1,
  pageSize = 10,
  search = "",
  enabled = true
) =>
  useQuery({
    queryKey: ["screen", pageNumber, pageSize, search],
    queryFn: async () => getScreen(pageNumber, pageSize, search),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    enabled,
  });


