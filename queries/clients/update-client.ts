import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Client } from "./get-client";

interface UpdateClientPayload {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  email: string;
  phonePrimary: string;
  phoneSecondary?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  isActive: boolean;
}

const updateClient = async (clientData: UpdateClientPayload): Promise<Client> => {
  console.log("updateClient function called with data:", clientData);
  
  try {
    const response = await fetch(`/api/clients/${clientData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });

    console.log("Client API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Client API error response:", errorData);
      throw new Error(errorData.message || 'Failed to update client');
    }

    const data = await response.json();
    console.log("Client updated successfully, API response:", data);
    return data as Client;
  } catch (error) {
    console.error("Error in updateClient function:", error);
    throw error;
  }
};

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      // Invalidate clients query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: Error) => {
      console.error("Client update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
    },
  });
} 