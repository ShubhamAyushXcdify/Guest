import { useQuery } from "@tanstack/react-query";

const getAppointmentById = async (id: string) => {
  try {
    const url = `/api/appointment/${id}`;
    
    const response = await fetch(url, {
      method: 'GET',
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

export const useGetAppointmentById = (id: string) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => getAppointmentById(id),
    enabled: !!id,
  })
} 