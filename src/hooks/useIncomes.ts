import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIncomes, createIncome, deleteIncome } from "@/api/incomes.api";
import type { Income } from "@/types";

export const incomesKey = (accountId?: string) => ["incomes", accountId ?? "all"];

export function useIncomes(accountId?: string) {
  return useQuery({
    queryKey: incomesKey(accountId),
    queryFn: () => getIncomes(accountId),
  });
}

export function useCreateIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createIncome,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incomes"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteIncome(accountId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteIncome,
    onMutate: async (id) => {
      const key = incomesKey(accountId);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Income[]>(key);
      qc.setQueryData<Income[]>(key, (old) => old?.filter((i) => i._id !== id) ?? []);
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(incomesKey(accountId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["incomes"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
