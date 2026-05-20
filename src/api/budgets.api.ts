import api from "./axios";
import type { Budget } from "@/types";

export const getBudgets = (month?: number, year?: number) =>
  api
    .get<{ success: boolean; data: Budget[] }>("/budgets", {
      params: month && year ? { month, year } : {},
    })
    .then((r) => r.data.data);

export const createBudget = (data: { category: string; monthlyLimit: number; month?: number; year?: number }) =>
  api.post<{ success: boolean; data: Budget }>("/budgets", data).then((r) => r.data.data);

export const updateBudget = ({ id, monthlyLimit }: { id: string; monthlyLimit: number }) =>
  api.put<{ success: boolean; data: Budget }>(`/budgets/${id}`, { monthlyLimit }).then((r) => r.data.data);

export const deleteBudget = (id: string) => api.delete(`/budgets/${id}`);
