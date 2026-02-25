import { useQuery } from "@tanstack/react-query";

export interface Plan {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const getPlans = async (): Promise<Plan[]> => {
  try {
    const response = await fetch('/api/Plan');
    
    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
};

export const useGetPlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
    staleTime: 60000, // 1 minute
  });
};

export default getPlans; 