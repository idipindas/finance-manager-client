import { Trash2, CreditCard } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { Account } from "@/types";

interface AccountCardProps {
  account: Account;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export default function AccountCard({ account, onDelete, compact }: AccountCardProps) {
  if (compact) {
    return (
      <div className="flex-shrink-0 bg-bg-card border border-border rounded-card p-4 w-44">
        <div className="flex items-center justify-between mb-3">
          <CreditCard size={16} className="text-accent" />
          <Badge variant={account.cardType}>{account.cardType}</Badge>
        </div>
        <p className="text-xs text-text-muted truncate">{account.bankName}</p>
        <p className="text-sm font-mono text-text-muted mt-0.5">••••• {account.lastFiveDigits}</p>
        <p className="text-base font-bold text-text-primary font-heading mt-2">
          {formatCurrency(account.balance ?? 0)}
        </p>
      </div>
    );
  }

  return (
    <div className="group relative bg-bg-card border border-border rounded-card p-5 hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
            <CreditCard size={18} className="text-accent" />
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm">{account.bankName}</p>
            <p className="text-xs font-mono text-text-muted">••••• {account.lastFiveDigits}</p>
          </div>
        </div>
        <Badge variant={account.cardType}>{account.cardType}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted mb-1">Balance</p>
          <p className="text-xl font-bold text-text-primary font-heading">
            {formatCurrency(account.balance ?? 0)}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(account._id)}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-text-muted hover:text-expense hover:bg-expense/10 transition-all"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
