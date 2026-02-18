import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

const updateAppointmentType = async ({ id, data }: { id: string; data: any }) => {
  const url = `/api/appointmentType/${id}`;
  const payload = {
    name: data.name,
    isActive: data.isActive,
  };
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getMessageFromErrorBody(result, 'Failed to update appointment type');
    throw new Error(message);
  }
  return result;
}

export const useUpdateAppointmentType = (options: any = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAppointmentType,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointmentType'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentType', variables.id] });
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};
