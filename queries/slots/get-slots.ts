import { useQuery } from "@tanstack/react-query";

export interface Slot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roomId?: string;
}

interface SlotsResponse {
  items: Slot[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const getSlots = async (
  page: number = 1, 
  pageSize: number = 10, 
  search: string = ""
): Promise<SlotsResponse> => {
  try {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    if (search) {
      searchParams.append("search", search);
    }

    const response = await fetch(`/api/slots?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch slots");
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching slots:", error);
    throw error;
  }
};

export function useGetSlots(page = 1, pageSize = 10, search = "", enabled = true) {
  return useQuery({
    queryKey: ['slots', page, pageSize, search],
    queryFn: () => getSlots(page, pageSize, search),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 