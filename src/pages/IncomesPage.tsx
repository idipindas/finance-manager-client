import { useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { useIncomes, useDeleteIncome } from "@/hooks/useIncomes";
import { useAccounts } from "@/hooks/useAccounts";
import TransactionRow from "@/components/cards/TransactionRow";
import Modal from "@/components/ui/Modal";
import BottomSheet from "@/components/ui/BottomSheet";
import AddIncomeForm from "@/components/forms/AddIncomeForm";
import { formatCurrency, isCurrentMonth } from "@/lib/utils";
import type { Income } from "@/types";

export default function IncomesPage() {
  const { data: accounts = [] } = useAccounts();
  const [accountId, setAccountId] = useState<string | undefined>();
  const { data: incomes = [], isLoading } = useIncomes(accountId);
  const deleteIncome = useDeleteIncome(accountId);
  const [open, setOpen] = useState(false);
  const isMobile = window.innerWidth < 768;
  const SheetOrModal = isMobile ? BottomSheet : Modal;

  const totalMonth = incomes
    .filter((i: Income) => isCurrentMonth(i.date))
    .reduce((s: number, i: Income) => s + i.amount, 0);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Incomes</h1>
          <p className="text-income text-sm font-medium mt-0.5">{formatCurrency(totalMonth)} this month</p>
        </div>
        <button
          onClick={() => {
            if (typeof navigator.vibrate === "function") navigator.vibrate(50);
            setOpen(true);
          }}
          className="w-11 h-11 rounded-full gradient-violet text-white flex items-center justify-center shadow-lg shadow-accent/30 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Account filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
        <button
          onClick={() => setAccountId(undefined)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            !accountId ? "bg-accent text-white" : "bg-bg-card border border-border text-text-muted"
          }`}
        >
          All
        </button>
        {accounts.map((a) => (
          <button
            key={a._id}
            onClick={() => setAccountId(a._id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              accountId === a._id ? "bg-accent text-white" : "bg-bg-card border border-border text-text-muted"
            }`}
          >
            {a.bankName} ••{a.lastFiveDigits}
          </button>
        ))}
      </div>

      <div className="bg-bg-card border border-border rounded-card px-4 py-2">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="shimmer h-14 rounded-xl my-2" />
          ))
        ) : incomes.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-income/10 flex items-center justify-center mb-3">
              <TrendingUp size={22} className="text-income" />
            </div>
            <p className="text-text-muted text-sm">No incomes found</p>
          </div>
        ) : (
          incomes.map((i: Income) => (
            <TransactionRow
              key={i._id}
              tx={{ ...i, type: "income" }}
              onDelete={(id) => deleteIncome.mutate(id)}
            />
          ))
        )}
      </div>

      <SheetOrModal open={open} onClose={() => setOpen(false)} title="Add Income">
        <AddIncomeForm
          onSuccess={() => setOpen(false)}
          defaultAccountId={accountId}
        />
      </SheetOrModal>
    </div>
  );
}
