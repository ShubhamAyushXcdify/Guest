import { useMutation, useQueryClient } from "@tanstack/react-query";

const createAppointmentType = async (data: any) => {
  try {
    const url = `/api/appointmentType`;
    // Only send name and isActive
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

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  } catch (error) {
    throw error;
  }
}

export const useCreateAppointmentType = (options: any = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAppointmentType,
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
