import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSplits,
  getSplitSummary,
  createSplit,
  settleParticipant,
  deleteSplit,
} from "@/api/splits.api";

export const SPLITS_KEY = ["splits"];
export const SPLITS_SUMMARY_KEY = ["splits", "summary"];

export function useSplits() {
  return useQuery({ queryKey: SPLITS_KEY, queryFn: getSplits });
}

export function useSplitSummary() {
  return useQuery({ queryKey: SPLITS_SUMMARY_KEY, queryFn: getSplitSummary });
}

export function useCreateSplit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSplit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SPLITS_KEY });
    },
  });
}

export function useSettleParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settleParticipant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SPLITS_KEY });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["incomes"] });
    },
  });
}

export function useDeleteSplit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSplit,
    onSuccess: () => qc.invalidateQueries({ queryKey: SPLITS_KEY }),
  });
}
