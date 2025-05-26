import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteProductParams {
  id: string;
}

const deleteProduct = async ({ id }: DeleteProductParams) => {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to delete product');
  }
  // Try to parse JSON, but if empty, just return null
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};
