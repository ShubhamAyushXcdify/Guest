import { useQuery } from "@tanstack/react-query";

interface SlotResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  items: Slot[];
}

export interface Slot {
  id: string;
  clinicId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isActive: boolean;
  isAvailable: boolean;
  name: string;
}

export const useGetSlotByRoomId = (
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  roomId: string
) => {
  return useQuery<SlotResponse>({
    queryKey: ['slots', 'byRoomId', roomId],
    queryFn: async () => {
      const response = await fetch(`/api/slots/room/${roomId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }
      
      return response.json();
    },
    enabled: !!roomId // Only fetch if roomId is provided
  });
};
