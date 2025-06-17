import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

const deleteClient = async (id: string): Promise<void> => {
  console.log("deleteClient function called with id:", id);
  
  try {
    const response = await fetch(`/api/clients/${id}`, {
      method: 'DELETE',
    });

    console.log("Client API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Client API error response:", errorData);
      throw new Error(errorData.message || 'Failed to delete client');
    }

    console.log("Client deleted successfully");
  } catch (error) {
    console.error("Error in deleteClient function:", error);
    throw error;
  }
};

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      // Invalidate clients query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Client deletion error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    },
  });
} 