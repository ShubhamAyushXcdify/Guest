import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateUserData {
  id: string;
  [key: string]: any;
}

const updateUser = async (data: UpdateUserData) => {
  try {
    const response = await fetch(`/api/user/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      
    },
  });
};
