import { useMutation } from "@tanstack/react-query";

const deleteDewormingVisit = async (id: string) => {
  const response = await fetch(`/api/deworming/intake/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete deworming visit');
  }
  return true;
};

export const useDeleteDewormingVisit = () => {
  return useMutation({
    mutationFn: deleteDewormingVisit,
  });
}; 