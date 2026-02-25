import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteComplaintParams {
  id: string;
  visitId?: string; // Optional, but useful for invalidating queries
}

const deleteComplaintDetails = async ({ id }: DeleteComplaintParams): Promise<void> => {
  try {
    if (!id) {
      throw new Error("Complaint ID is required");
    }
    
    const response = await fetch(`/api/complaintdetail/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete complaint details');
    }
    
    return;
  } catch (error) {
    console.error("Error deleting complaint details:", error);
    throw error;
  }
};

export const useDeleteComplaintDetails = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComplaintDetails,
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.id] });
      if (variables.visitId) {
        queryClient.invalidateQueries({ 
          queryKey: ['complaint', 'visit', variables.visitId] 
        });
      }
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};
