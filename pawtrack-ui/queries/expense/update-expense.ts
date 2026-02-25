import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateExpenseData {
  id: string;
  clinicId: string;
  dateOfExpense: string;
  category: string;
  amount: number;
  paymentMode: string;
  paidTo: string;
  description?: string;
}

const updateExpense = async (data: UpdateExpenseData) => {
  const response = await fetch(`/api/expense/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to update expense');
  }

  return response.json();
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExpense,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expense", data.id] });
      queryClient.invalidateQueries({ queryKey: ["expense"] });
    },
  });
};