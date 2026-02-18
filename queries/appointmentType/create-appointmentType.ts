import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

const createAppointmentType = async (data: any) => {
  const url = `/api/appointmentType`;
  const payload = {
    name: data.name,
    isActive: data.isActive,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getMessageFromErrorBody(result, 'Failed to create appointment type');
    throw new Error(message);
  }
  return result;
}

export const useCreateAppointmentType = (options: any = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointmentType,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointmentType'] });
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
