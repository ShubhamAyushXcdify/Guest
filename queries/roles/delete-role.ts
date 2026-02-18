import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

interface DeleteRoleParams {
  id: string;
}

const deleteRole = async ({ id }: DeleteRoleParams) => {
  const response = await fetch(`/api/role/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    const result = await response.json().catch(() => ({}));
    const message = getMessageFromErrorBody(result, 'Failed to delete role');
    throw new Error(message);
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
