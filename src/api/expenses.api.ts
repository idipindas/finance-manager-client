import api from "./axios";
import type { Expense } from "@/types";

interface ExpenseInput {
  accountId: string;
  amount: number;
  category: string;
  description?: string;
  date?: string;
}

export const getExpenses = (accountId?: string) =>
  api
    .get<{ success: boolean; data: Expense[] }>("/expenses", {
      params: accountId ? { accountId } : {},
    })
    .then((r) => r.data.data);

export const createExpense = (data: ExpenseInput) =>
  api.post<{ success: boolean; data: Expense }>("/expenses", data).then((r) => r.data.data);

export const deleteExpense = (id: string) =>
  api.delete(`/expenses/${id}`);
