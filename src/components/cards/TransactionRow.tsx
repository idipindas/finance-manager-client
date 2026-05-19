import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

interface TransactionRowProps {
  tx: Transaction;
  onDelete?: (id: string) => void;
}

export default function TransactionRow({ tx, onDelete }: TransactionRowProps) {
  const isIncome = tx.type === "income";
  const label = isIncome ? (tx as { source: string }).source : (tx as { category: string }).category;

  return (
    <div className="group flex items-center gap-3 py-3 px-1 border-b border-border/50 last:border-0 hover:bg-bg-elevated/30 rounded-xl px-3 -mx-3 transition-colors">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isIncome ? "bg-income/10" : "bg-expense/10"
        }`}
      >
        {isIncome ? (
          <TrendingUp size={16} className="text-income" />
        ) : (
          <TrendingDown size={16} className="text-expense" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant={isIncome ? "income" : "expense"}>{label}</Badge>
        </div>
        {tx.description && (
          <p className="text-xs text-text-muted mt-0.5 truncate">{tx.description}</p>
        )}
        <p className="text-xs text-text-muted mt-0.5">{formatDate(tx.date)}</p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-semibold font-heading ${
            isIncome ? "text-income" : "text-expense"
          }`}
        >
          {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
        </span>
        {onDelete && (
          <button
            onClick={() => onDelete(tx._id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-all"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
