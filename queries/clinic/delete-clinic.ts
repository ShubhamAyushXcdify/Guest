import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

interface DeleteClinicParams {
  id: string;
}

const deleteClinic = async ({ id }: DeleteClinicParams) => {
  const response = await fetch(`/api/clinic/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    const result = await response.json().catch(() => ({}));
    const message = getMessageFromErrorBody(result, 'Failed to delete clinic');
    throw new Error(message);
  }
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
