import { useQuery } from "@tanstack/react-query";

interface AppointmentResponse {
  items: any[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

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
    // Return the items array from the response
    return result.data.items;
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