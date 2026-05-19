import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes";
import AccountCard from "@/components/cards/AccountCard";
import TransactionRow from "@/components/cards/TransactionRow";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import Modal from "@/components/ui/Modal";
import BottomSheet from "@/components/ui/BottomSheet";
import AddExpenseForm from "@/components/forms/AddExpenseForm";
import AddIncomeForm from "@/components/forms/AddIncomeForm";
import { formatCurrency, isCurrentMonth } from "@/lib/utils";
import type { Transaction } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useDeleteExpense } from "@/hooks/useExpenses";
import { useDeleteIncome } from "@/hooks/useIncomes";

function SkeletonCard() {
  return <div className="shimmer h-24 rounded-card" />;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: accounts = [], isLoading: loadAccounts } = useAccounts();
  const { data: expenses = [], isLoading: loadExpenses } = useExpenses();
  const { data: incomes = [], isLoading: loadIncomes } = useIncomes();
  const deleteExpense = useDeleteExpense();
  const deleteIncome = useDeleteIncome();

  const isMobile = window.innerWidth < 768;
  const [fabOpen, setFabOpen] = useState(false);
  const [modal, setModal] = useState<"expense" | "income" | null>(null);

  const totalBalance = accounts.reduce((s, a) => s + (a.balance ?? 0), 0);

  const monthExpenses = expenses.filter((e) => isCurrentMonth(e.date));
  const monthIncomes = incomes.filter((i) => isCurrentMonth(i.date));
  const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = monthIncomes.reduce((s, i) => s + i.amount, 0);
  const netMonth = totalIncome - totalExpense;

  const recentTx: Transaction[] = [
    ...expenses.map((e) => ({ ...e, type: "expense" as const })),
    ...incomes.map((i) => ({ ...i, type: "income" as const })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const openForm = (type: "expense" | "income") => {
    setFabOpen(false);
    if (typeof navigator.vibrate === "function") navigator.vibrate(50);
    setTimeout(() => setModal(type), 50);
  };

  const FormComponent = modal === "expense" ? AddExpenseForm : AddIncomeForm;
  const formTitle = modal === "expense" ? "Add Expense" : "Add Income";

  const SheetOrModal = isMobile ? BottomSheet : Modal;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="pt-2">
        <p className="text-text-muted text-sm">Good {getGreeting()},</p>
        <h1 className="text-2xl font-bold text-text-primary font-heading">{user?.name ?? "there"}</h1>
      </div>

      {/* Hero balance card */}
      <div className="relative overflow-hidden rounded-card p-6 gradient-violet shadow-xl shadow-accent/20">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full" />
        <p className="text-white/70 text-sm font-medium mb-1">Total Balance</p>
        <p className="text-4xl font-bold text-white font-heading">{formatCurrency(totalBalance)}</p>
        <p className="text-white/60 text-xs mt-2">{accounts.length} account{accounts.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-3">
        {loadIncomes ? (
          <SkeletonCard />
        ) : (
          <div className="bg-bg-card border border-border rounded-card p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={14} className="text-income" />
              <span className="text-xs text-text-muted">Income</span>
            </div>
            <p className="text-base font-bold text-income font-heading">{formatCurrency(totalIncome)}</p>
          </div>
        )}
        {loadExpenses ? (
          <SkeletonCard />
        ) : (
          <div className="bg-bg-card border border-border rounded-card p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown size={14} className="text-expense" />
              <span className="text-xs text-text-muted">Expenses</span>
            </div>
            <p className="text-base font-bold text-expense font-heading">{formatCurrency(totalExpense)}</p>
          </div>
        )}
        <div className="bg-bg-card border border-border rounded-card p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Wallet size={14} className="text-accent" />
            <span className="text-xs text-text-muted">Net</span>
          </div>
          <p className={`text-base font-bold font-heading ${netMonth >= 0 ? "text-income" : "text-expense"}`}>
            {formatCurrency(Math.abs(netMonth))}
          </p>
        </div>
      </div>

      {/* Accounts scroll */}
      <section>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Accounts</h2>
        {loadAccounts ? (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="shimmer h-28 w-44 rounded-card flex-shrink-0" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">No accounts yet</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {accounts.map((a) => (
              <AccountCard key={a._id} account={a} compact />
            ))}
          </div>
        )}
      </section>

      {/* Pie chart */}
      {monthExpenses.length > 0 && (
        <section className="bg-bg-card border border-border rounded-card p-5">
          <h2 className="text-sm font-semibold text-text-primary font-heading mb-3">Spending by Category</h2>
          <CategoryPieChart expenses={monthExpenses} />
        </section>
      )}

      {/* Recent transactions */}
      <section>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Recent Transactions</h2>
        <div className="bg-bg-card border border-border rounded-card px-4 py-2">
          {loadExpenses || loadIncomes ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="shimmer h-14 rounded-xl my-2" />
            ))
          ) : recentTx.length === 0 ? (
            <p className="text-text-muted text-sm py-6 text-center">No transactions yet</p>
          ) : (
            recentTx.map((tx) => (
              <TransactionRow
                key={tx._id}
                tx={tx}
                onDelete={(id) => {
                  if (tx.type === "expense") deleteExpense.mutate(id);
                  else deleteIncome.mutate(id);
                }}
              />
            ))
          )}
        </div>
      </section>

      {/* FAB */}
      <div className="fixed bottom-20 right-4 md:bottom-6 z-30">
        {fabOpen && (
          <div className="flex flex-col gap-2 mb-3 items-end fade-in">
            <button
              onClick={() => openForm("income")}
              className="flex items-center gap-2 bg-income text-white px-4 py-2.5 rounded-full text-sm font-medium shadow-lg shadow-income/30 hover:opacity-90 transition-opacity"
            >
              <TrendingUp size={16} /> Income
            </button>
            <button
              onClick={() => openForm("expense")}
              className="flex items-center gap-2 bg-expense text-white px-4 py-2.5 rounded-full text-sm font-medium shadow-lg shadow-expense/30 hover:opacity-90 transition-opacity"
            >
              <TrendingDown size={16} /> Expense
            </button>
          </div>
        )}
        <button
          onClick={() => {
            if (typeof navigator.vibrate === "function") navigator.vibrate(50);
            setFabOpen((v) => !v);
          }}
          className={`w-14 h-14 rounded-full gradient-violet text-white shadow-xl shadow-accent/40 flex items-center justify-center transition-transform active:scale-95 ${fabOpen ? "rotate-45" : ""}`}
        >
          <Plus size={24} />
        </button>
      </div>

      {modal && (
        <SheetOrModal open={!!modal} onClose={() => setModal(null)} title={formTitle}>
          <FormComponent onSuccess={() => setModal(null)} />
        </SheetOrModal>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
