import { useQuery } from "@tanstack/react-query";

export interface AvailableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Fetches available slots for a specific user by ID
 * @param userId - The ID of the user to fetch slots for
 * @param date - Optional date parameter to filter slots by date
 * @returns Array of available slot objects
 */
const getAvailableSlotsByUserId = async (userId: string, date?: string): Promise<AvailableSlot[]> => {
  let url = `/api/user/${userId}/available-slots`;
  
  if (date) {
    // Ensure date is in YYYY-MM-DD format without timezone issues
    try {
      // If it's already a formatted string in YYYY-MM-DD format, use it directly
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        url += `?date=${encodeURIComponent(date)}`;
      } else {
        // If it's not in the correct format, try to parse and format it
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          // Create date in user's local timezone without conversion
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          url += `?date=${encodeURIComponent(formattedDate)}`;
        }
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      // Still try to use the original date if parsing fails
      url += `?date=${encodeURIComponent(date)}`;
    }
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch available slots');
  }
  
  return response.json();
};

/**
 * React Query hook to fetch available slots for a user
 * @param userId - The ID of the user to fetch slots for
 * @param date - Optional date parameter to filter slots by date
 * @param enabled - Whether the query should automatically run
 * @returns Query result with available slots data
 */
export const useGetAvailableSlotsByUserId = (
  userId: string, 
  date?: string, 
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["availableSlots", userId, date],
    queryFn: () => getAvailableSlotsByUserId(userId, date),
    enabled: !!userId && enabled,
    refetchOnWindowFocus: false,
  });
};
