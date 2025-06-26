import { useQuery } from "@tanstack/react-query";
import { Slot } from "./get-slot-by-roomId";

export const useGetSlotById = (slotId: string) => {
  return useQuery<Slot>({
    queryKey: ['slots', 'byId', slotId],
    queryFn: async () => {
      const response = await fetch(`/api/slots/${slotId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch slot');
      }
      
      return response.json();
    },
    enabled: !!slotId // Only fetch if slotId is provided
  });
};
