import { useMutation, useQueryClient } from "@tanstack/react-query";

const updateAppointmentType = async ({ id, data }: { id: string; data: any }) => {
  try {
    const url = `/api/appointmentType/${id}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  } catch (error) {
    throw error;
  }
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
