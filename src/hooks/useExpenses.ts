import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, createExpense, deleteExpense } from "@/api/expenses.api";
import type { Expense } from "@/types";

export const expensesKey = (accountId?: string) => ["expenses", accountId ?? "all"];

export function useExpenses(accountId?: string) {
  return useQuery({
    queryKey: expensesKey(accountId),
    queryFn: () => getExpenses(accountId),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteExpense(accountId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onMutate: async (id) => {
      const key = expensesKey(accountId);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Expense[]>(key);
      qc.setQueryData<Expense[]>(key, (old) => old?.filter((e) => e._id !== id) ?? []);
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(expensesKey(accountId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
