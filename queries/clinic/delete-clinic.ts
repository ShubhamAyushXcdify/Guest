import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteClinicParams {
  id: string;
}

const deleteClinic = async ({ id }: DeleteClinicParams) => {
  const response = await fetch(`/api/clinic/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to delete clinic');
  }
  // Try to parse JSON, but if empty, just return null
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const useDeleteClinic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClinic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic"] });
    },
  });
};
