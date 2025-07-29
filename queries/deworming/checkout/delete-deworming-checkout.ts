import { useMutation } from "@tanstack/react-query";

const deleteDewormingCheckout = async (id: string) => {
  const response = await fetch(`/api/deworming/checkout/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete deworming checkout');
  }
  return true;
};

export const useDeleteDewormingCheckout = () => {
  return useMutation({
    mutationFn: deleteDewormingCheckout,
  });
}; 