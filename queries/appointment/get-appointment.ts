import { useQuery } from "@tanstack/react-query";

const getAppointments = async () => {
  try {
    const url = `/api/appointment`;
    
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

export const useGetAppointments = () => {
  return useQuery({
    queryKey: ['appointment'],
    queryFn: getAppointments,
  })
} 