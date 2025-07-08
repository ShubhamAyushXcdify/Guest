import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { ClientRegistration } from "./create-registration";

interface ApproveRegistrationPayload {
  registrationId: string;
  isApproved: boolean;
  rejectionReason?: string;
}

const approveClientRegistration = async (payload: ApproveRegistrationPayload): Promise<ClientRegistration> => {
  try {
    const response = await fetch('/api/clientRegistration/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Client Registration approval error:", errorData);
      throw new Error(errorData.message || 'Failed to approve client registration');
    }

    const data = await response.json();
    return data as ClientRegistration;
  } catch (error) {
    console.error("Error in approveClientRegistration function:", error);
    throw error;
  }
};

export function useApproveClientRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveClientRegistration,
    onSuccess: () => {
      // Invalidate and refetch client registrations queries
      queryClient.invalidateQueries({ queryKey: ['clientRegistrations'] });
      queryClient.invalidateQueries({ queryKey: ['clientRegistrations', 'pending'] });
      
      
      toast({
        title: "Success",
        description: "Client registration status updated successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Client registration approval error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update client registration status",
        variant: "destructive",
      });
    },
  });
}
