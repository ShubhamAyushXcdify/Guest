import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteUserParams {
  id: string;
}

const deleteUser = async ({ id }: DeleteUserParams) => {
  try {
    const response = await fetch(`/api/user/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};
