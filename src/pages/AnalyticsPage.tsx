import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes";
import PeriodBarChart from "@/components/charts/PeriodBarChart";
import {
  buildPeriodBuckets,
  buildCategoryBuckets,
  filterCurrentPeriod,
  daysElapsed,
  type Period,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

const CATEGORY_COLORS = [
  "#7c5af6", "#22c55e", "#f59e0b", "#06b6d4",
  "#8b5cf6", "#10b981", "#eab308", "#3b82f6", "#f43f5e", "#ec4899",
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const { data: expenses = [], isLoading: loadExp } = useExpenses();
  const { data: incomes = [], isLoading: loadInc } = useIncomes();

  const isLoading = loadExp || loadInc;

  const buckets = buildPeriodBuckets(expenses, incomes, period, 6);
  const current = buckets[buckets.length - 1] ?? { income: 0, expense: 0, net: 0 };
  const previous = buckets[buckets.length - 2] ?? { income: 0, expense: 0, net: 0 };

  const periodExpenses = filterCurrentPeriod(expenses, period);
  const categories = buildCategoryBuckets(periodExpenses);

  const savingsRate =
    current.income > 0 ? Math.round((current.net / current.income) * 100) : 0;
  const days = daysElapsed(period);
  const dailyAvg = days > 0 ? current.expense / days : 0;

  const expenseDelta = current.expense - previous.expense;
  const expenseDeltaPct =
    previous.expense > 0 ? Math.round(Math.abs(expenseDelta / previous.expense) * 100) : null;

  const periodLabel = period === "monthly" ? "month" : "week";

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* Header + period switcher */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-text-primary font-heading">Analytics</h1>
        <div className="flex bg-bg-elevated border border-border rounded-full p-0.5 gap-0.5">
          {(["weekly", "monthly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
                period === p
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {p === "weekly" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer h-28 rounded-card" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<TrendingUp size={15} className="text-income" />}
              label={`This ${periodLabel}`}
              sublabel="Income"
              value={formatCurrency(current.income)}
              valueClass="text-income"
            />
            <StatCard
              icon={<TrendingDown size={15} className="text-expense" />}
              label={`This ${periodLabel}`}
              sublabel="Expenses"
              value={formatCurrency(current.expense)}
              valueClass="text-expense"
            />
            <StatCard
              icon={<Wallet size={15} className="text-accent" />}
              label="Savings rate"
              sublabel={`Net ${formatCurrency(current.net)}`}
              value={`${savingsRate}%`}
              valueClass={savingsRate >= 0 ? "text-income" : "text-expense"}
            />
            <StatCard
              icon={<CalendarDays size={15} className="text-text-muted" />}
              label="Daily average"
              sublabel={`Over ${days} day${days !== 1 ? "s" : ""}`}
              value={formatCurrency(dailyAvg)}
              valueClass="text-text-primary"
            />
          </div>

          {/* vs previous period */}
          {previous.expense > 0 && (
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-card border text-sm font-medium ${
                expenseDelta > 0
                  ? "bg-expense/8 border-expense/20 text-expense"
                  : expenseDelta < 0
                  ? "bg-income/8 border-income/20 text-income"
                  : "bg-bg-card border-border text-text-muted"
              }`}
            >
              {expenseDelta > 0 ? (
                <ArrowUp size={16} />
              ) : expenseDelta < 0 ? (
                <ArrowDown size={16} />
              ) : (
                <Minus size={16} />
              )}
              <span>
                {expenseDelta === 0
                  ? `Same spending as last ${periodLabel}`
                  : `${formatCurrency(Math.abs(expenseDelta))} ${
                      expenseDelta > 0 ? "more" : "less"
                    } spent than last ${periodLabel}`}
                {expenseDeltaPct !== null && expenseDelta !== 0 && (
                  <span className="opacity-70 ml-1">({expenseDeltaPct}%)</span>
                )}
              </span>
            </div>
          )}

          {/* Bar chart */}
          <section className="bg-bg-card border border-border rounded-card p-5">
            <h2 className="text-sm font-semibold text-text-primary font-heading mb-4">
              Income vs Expenses
            </h2>
            {buckets.every((b) => b.income === 0 && b.expense === 0) ? (
              <p className="text-text-muted text-sm text-center py-10">No data yet</p>
            ) : (
              <PeriodBarChart data={buckets} />
            )}
          </section>

          {/* Category breakdown */}
          {categories.length > 0 && (
            <section className="bg-bg-card border border-border rounded-card p-5">
              <h2 className="text-sm font-semibold text-text-primary font-heading mb-4">
                Spending by Category
                <span className="text-text-muted font-normal ml-1.5 text-xs">
                  this {periodLabel}
                </span>
              </h2>
              <div className="space-y-3.5">
                {categories.slice(0, 8).map((cat, i) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                        />
                        <span className="text-sm text-text-primary">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-text-muted">{cat.pct}%</span>
                        <span className="font-semibold text-text-primary font-heading">
                          {formatCurrency(cat.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.pct}%`,
                          background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Top insight */}
          {categories.length > 0 && (
            <div className="bg-accent/8 border border-accent/20 rounded-card px-4 py-3.5">
              <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">
                Top Spend
              </p>
              <p className="text-text-primary text-sm">
                <span className="font-bold">{categories[0].name}</span> is your biggest expense
                this {periodLabel} at{" "}
                <span className="text-expense font-bold">
                  {formatCurrency(categories[0].amount)}
                </span>{" "}
                ({categories[0].pct}% of total)
              </p>
            </div>
          )}

          {expenses.length === 0 && incomes.length === 0 && (
            <div className="text-center py-16 text-text-muted text-sm">
              Add some transactions to see analytics
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  value: string;
  valueClass?: string;
}

function StatCard({ icon, label, sublabel, value, valueClass }: StatCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-card p-4">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <p className={`text-lg font-bold font-heading leading-tight ${valueClass}`}>{value}</p>
      <p className="text-[11px] text-text-muted mt-0.5">{sublabel}</p>
    </div>
  );
}
