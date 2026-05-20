import type { Expense, Income } from "@/types";

export type Period = "weekly" | "monthly";

export interface PeriodBucket {
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBucket {
  name: string;
  amount: number;
  pct: number;
}

function startOfWeek(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  c.setDate(c.getDate() - c.getDay());
  return c;
}

function weekKey(d: Date): string {
  return startOfWeek(d).toISOString().split("T")[0];
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function weekLabel(key: string): string {
  const d = new Date(key + "T00:00:00");
  return d.toLocaleString("en-IN", { month: "short", day: "numeric" });
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

export function buildPeriodBuckets(
  expenses: Expense[],
  incomes: Income[],
  period: Period,
  count = 6
): PeriodBucket[] {
  const now = new Date();
  const keys: string[] = [];

  for (let i = count - 1; i >= 0; i--) {
    if (period === "monthly") {
      keys.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
    } else {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      keys.push(weekKey(d));
    }
  }

  const keySet = new Set(keys);
  const getKey =
    period === "monthly"
      ? (s: string) => monthKey(new Date(s))
      : (s: string) => weekKey(new Date(s));

  const expMap: Record<string, number> = {};
  const incMap: Record<string, number> = {};

  expenses.forEach((e) => {
    const k = getKey(e.date);
    if (keySet.has(k)) expMap[k] = (expMap[k] ?? 0) + e.amount;
  });
  incomes.forEach((i) => {
    const k = getKey(i.date);
    if (keySet.has(k)) incMap[k] = (incMap[k] ?? 0) + i.amount;
  });

  const labelFn = period === "monthly" ? monthLabel : weekLabel;
  return keys.map((k) => ({
    label: labelFn(k),
    income: incMap[k] ?? 0,
    expense: expMap[k] ?? 0,
    net: (incMap[k] ?? 0) - (expMap[k] ?? 0),
  }));
}

export function buildCategoryBuckets(expenses: Expense[]): CategoryBucket[] {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const map: Record<string, number> = {};
  expenses.forEach((e) => {
    map[e.category] = (map[e.category] ?? 0) + e.amount;
  });
  return Object.entries(map)
    .map(([name, amount]) => ({
      name,
      amount,
      pct: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function filterCurrentPeriod<T extends { date: string }>(
  items: T[],
  period: Period
): T[] {
  const now = new Date();
  return items.filter((item) => {
    const d = new Date(item.date);
    if (period === "monthly") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return d >= startOfWeek(now);
  });
}

export function daysElapsed(period: Period): number {
  const now = new Date();
  return period === "monthly" ? now.getDate() : now.getDay() + 1;
}
