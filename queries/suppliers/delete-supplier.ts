import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteSupplierParams {
  id: string;
}

const deleteSupplier = async ({ id }: DeleteSupplierParams) => {
  const response = await fetch(`/api/supplier/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to delete supplier');
  }
  // Try to parse JSON, but if empty, just return null
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