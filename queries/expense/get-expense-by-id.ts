// queries/expense/get-expense-by-id.ts
import { useQuery } from "@tanstack/react-query";

export interface Expense {
  id: string;
  clinicId: string;
  dateOfExpense: string;
  category: string;
  amount: number;
  paymentMode: string;
  paidTo: string;
  description: string;
}

const getExpenseById = async (id: string): Promise<Expense> => {
  const response = await fetch(`/api/expense/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch expense details");
  }
  return response.json();
};

export const useGetExpenseById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => getExpenseById(id),
    enabled,
  });
};
