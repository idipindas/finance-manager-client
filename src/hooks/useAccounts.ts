import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccounts, createAccount, deleteAccount } from "@/api/accounts.api";

export const ACCOUNTS_KEY = ["accounts"];

export function useAccounts() {
  return useQuery({ queryKey: ACCOUNTS_KEY, queryFn: getAccounts });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ACCOUNTS_KEY });
      const prev = qc.getQueryData(ACCOUNTS_KEY);
      qc.setQueryData(ACCOUNTS_KEY, (old: unknown) =>
        Array.isArray(old) ? old.filter((a: { _id: string }) => a._id !== id) : old
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(ACCOUNTS_KEY, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}
