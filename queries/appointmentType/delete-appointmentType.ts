import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteAppointmentType = async (id: string) => {
  try {
    const url = `/api/appointmentType/${id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
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

export const useDeleteAppointmentType = (options: any = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAppointmentType,
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
