import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFriends, addFriend, deleteFriend } from "@/api/friends.api";
import type { Friend } from "@/types";

export const FRIENDS_KEY = ["friends"];

export function useFriends() {
  return useQuery({ queryKey: FRIENDS_KEY, queryFn: getFriends });
}

export function useAddFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addFriend,
    onSuccess: () => qc.invalidateQueries({ queryKey: FRIENDS_KEY }),
  });
}

export function useDeleteFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFriend,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: FRIENDS_KEY });
      const prev = qc.getQueryData<Friend[]>(FRIENDS_KEY);
      qc.setQueryData<Friend[]>(FRIENDS_KEY, (old) => old?.filter((f) => f._id !== id) ?? []);
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(FRIENDS_KEY, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: FRIENDS_KEY }),
  });
}
