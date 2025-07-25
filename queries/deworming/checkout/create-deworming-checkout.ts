import { useMutation } from "@tanstack/react-query";

export interface CreateDewormingCheckoutDto {
  visitId: string;
  summary?: string;
  nextDewormingDueDate?: string;
  homeCareInstructions?: string;
  clientAcknowledged?: boolean;
  isCompleted?: boolean;
}

const createDewormingCheckout = async (data: CreateDewormingCheckoutDto) => {
  const response = await fetch(`/api/deworming/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create deworming checkout');
  }
  return response.json();
};

export const useCreateDewormingCheckout = () => {
  return useMutation({
    mutationFn: createDewormingCheckout,
  });
}; 