import { useQuery } from "@tanstack/react-query";
import { DoctorSlot } from "./get-doctorSlots";

export const getDoctorSlotsById = async (id: string): Promise<DoctorSlot | null> => {
  if (!id) throw new Error('Doctor slot ID is required');
  
  try {
    const response = await fetch(`/api/doctorSlots/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch doctor slot');
    }
    
    const data = await response.json();
    return data as DoctorSlot;
  } catch (error) {
    console.error(`Error fetching doctor slot with ID ${id}:`, error);
    throw error;
  }
};

export function useGetDoctorSlotById(id: string) {
  return useQuery({
    queryKey: ['doctorSlot', id],
    queryFn: () => getDoctorSlotsById(id),
    enabled: !!id,
    retry: 1,
  });
}
