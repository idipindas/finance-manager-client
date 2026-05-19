import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, suggestCategory } from "@/api/categories.api";

export const CATEGORIES_KEY = ["categories"];

export function useCategories() {
  return useQuery({ queryKey: CATEGORIES_KEY, queryFn: getCategories });
}

export function useSuggestCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: suggestCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
