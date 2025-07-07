import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

const deleteClientRegistration = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/clientRegistration/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Client Registration deletion error:", errorData);
      throw new Error(errorData.message || 'Failed to delete client registration');
    }
  } catch (error) {
    console.error("Error in deleteClientRegistration function:", error);
    throw error;
  }
};

export function useDeleteClientRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClientRegistration,
    onSuccess: () => {
      // Invalidate and refetch client registrations queries
      queryClient.invalidateQueries({ queryKey: ['clientRegistrations'] });
      toast({
        title: "Success",
        description: "Client registration deleted successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Client registration deletion error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete client registration",
        variant: "destructive",
      });
    },
  });
}
