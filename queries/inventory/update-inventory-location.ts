import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export interface UpdateLocationData {
  id: string;
  location: string;
  notes?: string;
}

export const updateInventoryLocation = async (data: UpdateLocationData) => {
  const response = await fetch(`/api/inventory/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      location: data.location,
      notes: data.notes,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update inventory location');
  }

  return response.json();
};

export const useUpdateInventoryLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInventoryLocation,
    onSuccess: (data, variables) => {
      // Invalidate and refetch inventory queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      toast({
        title: "Location Updated",
        description: `Location successfully updated to ${variables.location}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}; 