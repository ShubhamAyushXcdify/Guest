import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

interface UpdateSupplierData {
  id: string;
  [key: string]: any;
}

const updateSupplier = async (data: UpdateSupplierData) => {
  const response = await fetch(`/api/supplier/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok && response.status !== 204) {
    const result = await response.json().catch(() => ({}));
    const message = getMessageFromErrorBody(result, 'Failed to update supplier');
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSupplier,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
    },
  });
};