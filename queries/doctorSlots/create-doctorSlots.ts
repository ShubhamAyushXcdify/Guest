import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { DoctorSlot } from "./get-doctorSlots";

interface CreateDoctorSlotPayload {
  day: string;
  startTime: string;
  endTime: string;
}

const createDoctorSlot = async (data: CreateDoctorSlotPayload): Promise<DoctorSlot> => {
  try {
    const response = await fetch('/api/doctorSlots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Doctor slot API error response:", errorData);
      throw new Error(errorData.message || 'Failed to create doctor slot');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error in createDoctorSlot function:", error);
    throw error;
  }
};

export function useCreateDoctorSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDoctorSlot,
    onSuccess: () => {
      // Invalidate doctorSlots query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['doctorSlots'] });
      toast({
        title: "Success",
        description: "Doctor slot created successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Doctor slot creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create doctor slot",
        variant: "destructive",
      });
    },
  });
}

export { createDoctorSlot as createDoctorSlots };
