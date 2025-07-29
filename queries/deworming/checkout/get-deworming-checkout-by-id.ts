import { useQuery } from "@tanstack/react-query";

export interface DewormingCheckoutDetail {
  id: string;
  visitId: string;
  summary?: string;
  nextDewormingDueDate?: string;
  homeCareInstructions?: string;
  clientAcknowledged: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getDewormingCheckoutById = async (id: string): Promise<DewormingCheckoutDetail> => {
  if (!id) {
    throw new Error('DewormingCheckout ID is required');
  }
  
  const response = await fetch(`/api/deworming/checkout/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch deworming checkout data');
  }
  
  return response.json();
};

export const useGetDewormingCheckoutById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['dewormingCheckout', id],
    queryFn: () => getDewormingCheckoutById(id),
    enabled: !!id && enabled,
  });
}; 