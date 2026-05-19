export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Account {
  _id: string;
  userId: string;
  bankName: string;
  lastFiveDigits: string;
  cardType: "debit" | "credit";
  balance?: number;
}

export interface Expense {
  _id: string;
  userId: string;
  accountId: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface Income {
  _id: string;
  userId: string;
  accountId: string;
  amount: number;
  source: string;
  description?: string;
  date: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type Transaction =
  | (Expense & { type: "expense" })
  | (Income & { type: "income" });
