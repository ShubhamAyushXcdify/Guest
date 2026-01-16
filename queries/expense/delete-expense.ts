import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteExpenseParams {
  id: string;
}

const deleteExpense = async ({ id }: DeleteExpenseParams) => {
  const response = await fetch(`/api/expense/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to delete expense');
  }
  // Try to parse JSON, but if empty, just return null
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense"] });
    },
  });
};