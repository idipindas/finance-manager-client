import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "@/api/budgets.api";

const budgetsKey = (month?: number, year?: number) => ["budgets", month, year];

export function useBudgets(month?: number, year?: number) {
  return useQuery({
    queryKey: budgetsKey(month, year),
    queryFn: () => getBudgets(month, year),
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}
