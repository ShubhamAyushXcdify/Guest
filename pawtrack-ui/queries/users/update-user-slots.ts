import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateUserSlotsParams {
  userId: string;
  clinicId: string;
  slotIds: string[];
}

/**
 * Updates the slots assigned to a user
 * @param userId The ID of the user
 * @param clinicId The ID of the clinic
 * @param slotIds Array of slot IDs to assign to the user
 */
const updateUserSlots = async ({ userId, clinicId, slotIds }: UpdateUserSlotsParams) => {
  try {
    const response = await fetch(`/api/user/${userId}/slots`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clinicId,
        slotIds
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user slots: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error updating user slots:', error);
    throw error;
  }
};

export const useUpdateUserSlots = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserSlots,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctorSlots'] });
    },
  });
};