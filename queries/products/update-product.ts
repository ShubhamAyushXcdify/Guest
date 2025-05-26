import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateProductData {
  id: string;
  [key: string]: any;
}

const updateProduct = async (data: UpdateProductData) => {
  const response = await fetch(`/api/products/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to update product');
  }
  return response.status === 204 ? null : response.json();
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};
