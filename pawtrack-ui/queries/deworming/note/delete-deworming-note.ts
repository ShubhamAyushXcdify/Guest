import { useMutation } from "@tanstack/react-query";

const deleteDewormingNote = async (id: string) => {
  const response = await fetch(`/api/deworming/note/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete deworming note');
  }
  return true;
};

export const useDeleteDewormingNote = () => {
  return useMutation({
    mutationFn: deleteDewormingNote,
  });
}; 