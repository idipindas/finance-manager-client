import api from "./axios";
import type { Friend } from "@/types";

export const getFriends = () =>
  api.get<{ success: boolean; data: Friend[] }>("/friends").then((r) => r.data.data);

export const addFriend = (name: string) =>
  api.post<{ success: boolean; data: Friend }>("/friends", { name }).then((r) => r.data.data);

export const deleteFriend = (id: string) => api.delete(`/friends/${id}`);
