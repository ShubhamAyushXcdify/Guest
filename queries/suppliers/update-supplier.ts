import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    throw new Error('Failed to update supplier');
  }
  return response.status === 204 ? null : response.json();
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
    },
  });
};