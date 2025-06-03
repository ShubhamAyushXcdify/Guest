import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteRoleParams {
  id: string;
}

const deleteRole = async ({ id }: DeleteRoleParams) => {
  const response = await fetch(`/api/role/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to delete role');
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role"] });
    },
  });
};
