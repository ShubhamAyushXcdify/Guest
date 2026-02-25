import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

export interface CreateExpenseData {
  clinicId: string;
  dateOfExpense: string;
  category: string;
  amount: number;
  paymentMode: string;
  paidTo: string;
  description?: string;
}

const createExpense = async (data: CreateExpenseData) => {
  const response = await fetch('/api/expense', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getMessageFromErrorBody(result, 'Failed to create expense');
    throw new Error(message);
  }
  return result;
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense"] });
    },
  });
};