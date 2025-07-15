import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export const deleteDoctorSlots = async (id: string): Promise<boolean> => {
  if (!id) throw new Error('Doctor slot ID is required');
  
  try {
    const response = await fetch(`/api/doctorSlots/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return false;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Doctor slot API error response:", errorData);
      throw new Error(errorData.message || 'Failed to delete doctor slot');
    }

    return true;
  } catch (error) {
    console.error(`Error deleting doctor slot with ID ${id}:`, error);
    throw error;
  }
};

export function useDeleteDoctorSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDoctorSlots,
    onSuccess: () => {
      // Invalidate doctorSlots query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['doctorSlots'] });
      toast({
        title: "Success",
        description: "Doctor slot deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Doctor slot deletion error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete doctor slot",
        variant: "destructive",
      });
    },
  });
}
