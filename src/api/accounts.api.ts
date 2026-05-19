import api from "./axios";
import type { Account } from "@/types";

interface AccountInput {
  bankName: string;
  lastFiveDigits: string;
  cardType: "debit" | "credit";
  balance?: number;
}

export const getAccounts = () =>
  api.get<{ success: boolean; data: Account[] }>("/accounts").then((r) => r.data.data);

export const createAccount = (data: AccountInput) =>
  api.post<{ success: boolean; data: Account }>("/accounts", data).then((r) => r.data.data);

export const deleteAccount = (id: string) =>
  api.delete(`/accounts/${id}`);
