import api from "./axios";
import type { Split, SplitSummary } from "@/types";

export interface CreateSplitPayload {
  title: string;
  totalAmount: number;
  paidBy: "self" | "friend";
  friendName?: string;
  participants: { name: string; share: number; isYou?: boolean }[];
  category: string;
  date: string;
  notes?: string;
}

export const getSplits = () =>
  api.get<{ success: boolean; data: Split[] }>("/splits").then((r) => r.data.data);

export const getSplitSummary = () =>
  api.get<{ success: boolean; data: SplitSummary }>("/splits/summary").then((r) => r.data.data);

export const createSplit = (payload: CreateSplitPayload) =>
  api.post<{ success: boolean; data: Split }>("/splits", payload).then((r) => r.data.data);

export const settleParticipant = ({
  splitId,
  participantIndex,
  accountId,
}: {
  splitId: string;
  participantIndex: number;
  accountId?: string;
}) =>
  api
    .patch<{ success: boolean; data: Split }>(
      `/splits/${splitId}/participants/${participantIndex}/settle`,
      accountId ? { accountId } : {}
    )
    .then((r) => r.data.data);

export const deleteSplit = (id: string) => api.delete(`/splits/${id}`);
