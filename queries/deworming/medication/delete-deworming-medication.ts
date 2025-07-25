import { useMutation } from "@tanstack/react-query";

const deleteDewormingMedication = async (id: string) => {
  const response = await fetch(`/api/deworming/medication/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete deworming medication');
  }
  return true;
};

export const useDeleteDewormingMedication = () => {
  return useMutation({
    mutationFn: deleteDewormingMedication,
  });
}; 