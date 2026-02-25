import { useMutation } from "@tanstack/react-query";

export interface UpdateDewormingCheckoutDto {
  id: string;
  visitId: string;
  summary?: string;
  nextDewormingDueDate?: string;
  homeCareInstructions?: string;
  clientAcknowledged?: boolean;
  isCompleted?: boolean;
}

const updateDewormingCheckout = async (data: UpdateDewormingCheckoutDto) => {
  const response = await fetch(`/api/deworming/checkout/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update deworming checkout');
  }
  return response.json();
};

export const useUpdateDewormingCheckout = () => {
  return useMutation({
    mutationFn: updateDewormingCheckout,
  });
}; 