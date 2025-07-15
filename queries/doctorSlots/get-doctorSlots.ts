import { useQuery } from "@tanstack/react-query";

export interface DoctorSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface DoctorSlotsResponse {
  items: DoctorSlot[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const getDoctorSlots = async () => {
  try {
    const response = await fetch('/api/doctorSlots');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch doctor slots');
    }
    
    const data = await response.json();
    return data as DoctorSlot[];
  } catch (error) {
    console.error("Error fetching doctor slots:", error);
    throw error;
  }
};

export function useGetDoctorSlots(enabled = true) {
  return useQuery({
    queryKey: ['doctorSlots'],
    queryFn: getDoctorSlots,
    enabled,
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
