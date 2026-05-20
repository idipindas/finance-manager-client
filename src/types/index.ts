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

export interface SplitParticipant {
  name: string;
  share: number;
  isYou?: boolean;
  isPaid: boolean;
  paidAt?: string;
}

export interface Split {
  _id: string;
  userId: string;
  title: string;
  totalAmount: number;
  paidBy: "self" | "friend";
  friendName?: string;
  participants: SplitParticipant[];
  category: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface SplitSummary {
  youAreOwed: number;
  youOwe: number;
  net: number;
}

export interface Friend {
  _id: string;
  name: string;
}

export interface Budget {
  _id: string;
  category: string;
  monthlyLimit: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
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
