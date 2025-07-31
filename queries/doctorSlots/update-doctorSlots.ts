import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { DoctorSlot } from "./get-doctorSlots";

interface UpdateDoctorSlotPayload {
  day: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export const updateDoctorSlots = async (id: string, data: UpdateDoctorSlotPayload): Promise<DoctorSlot | null> => {
  if (!id) throw new Error('Doctor slot ID is required');
  
  try {
    const response = await fetch(`/api/doctorSlots/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Doctor slot API error response:", errorData);
      throw new Error(errorData.message || 'Failed to update doctor slot');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(`Error updating doctor slot with ID ${id}:`, error);
    throw error;
  }
};

export function useUpdateDoctorSlot(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDoctorSlotPayload) => updateDoctorSlots(id, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['doctorSlots'] });
      queryClient.invalidateQueries({ queryKey: ['doctorSlot', id] });
      toast({
        title: "Success",
        description: "Doctor slot updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Doctor slot update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update doctor slot",
        variant: "destructive",
      });
    },
  });
}
