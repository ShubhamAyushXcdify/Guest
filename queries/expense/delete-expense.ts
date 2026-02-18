import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

interface DeleteExpenseParams {
  id: string;
}

const deleteExpense = async ({ id }: DeleteExpenseParams) => {
  const response = await fetch(`/api/expense/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    const result = await response.json().catch(() => ({}));
    const message = getMessageFromErrorBody(result, 'Failed to delete expense');
    throw new Error(message);
  }
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
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense"] });
    },
  });
};