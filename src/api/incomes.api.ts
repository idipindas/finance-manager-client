import api from "./axios";
import type { Income } from "@/types";

interface IncomeInput {
  accountId: string;
  amount: number;
  source: string;
  description?: string;
  date?: string;
}

export const getIncomes = (accountId?: string) =>
  api
    .get<{ success: boolean; data: Income[] }>("/incomes", {
      params: accountId ? { accountId } : {},
    })
    .then((r) => r.data.data);

export const createIncome = (data: IncomeInput) =>
  api.post<{ success: boolean; data: Income }>("/incomes", data).then((r) => r.data.data);

export const deleteIncome = (id: string) =>
  api.delete(`/incomes/${id}`);
