import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to create expense');
  }

  return response.json();
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense"] });
    },
  });
};