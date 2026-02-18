import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

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
    const result = await response.json().catch(() => ({}));
    const message = getMessageFromErrorBody(result, 'Failed to update product');
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};
