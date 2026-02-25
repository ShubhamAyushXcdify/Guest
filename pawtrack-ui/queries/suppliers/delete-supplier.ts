import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

interface DeleteSupplierParams {
  id: string;
}

const deleteSupplier = async ({ id }: DeleteSupplierParams) => {
  const response = await fetch(`/api/supplier/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    const result = await response.json().catch(() => ({}));
    const message = getMessageFromErrorBody(result, 'Failed to delete supplier');
    throw new Error(message);
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
    },
  });
};