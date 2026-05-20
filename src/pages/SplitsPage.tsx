import { useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  X,
} from "lucide-react";
import { useSplits, useSplitSummary, useSettleParticipant, useDeleteSplit } from "@/hooks/useSplits";
import { useAccounts } from "@/hooks/useAccounts";
import { formatCurrency } from "@/lib/utils";
import CreateSplitSheet from "@/components/splits/CreateSplitSheet";
import type { Split } from "@/types";

type Filter = "all" | "self" | "friend";

interface SettleTarget {
  splitId: string;
  participantIndex: number;
  participantName: string;
  share: number;
  isYou?: boolean;
  splitPaidBy: "self" | "friend";
}

export default function SplitsPage() {
  const { data: splits = [], isLoading } = useSplits();
  const { data: summary } = useSplitSummary();
  const settleParticipant = useSettleParticipant();
  const deleteSplit = useDeleteSplit();
  const { data: accounts = [] } = useAccounts();

  const [filter, setFilter] = useState<Filter>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [settleTarget, setSettleTarget] = useState<SettleTarget | null>(null);
  const [settleAccountId, setSettleAccountId] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = splits.filter((s) => {
    if (filter === "self") return s.paidBy === "self";
    if (filter === "friend") return s.paidBy === "friend";
    return true;
  });

  function openSettle(s: Split, idx: number) {
    const p = s.participants[idx];
    setSettleTarget({
      splitId: s._id,
      participantIndex: idx,
      participantName: p.name,
      share: p.share,
      isYou: p.isYou,
      splitPaidBy: s.paidBy,
    });
    setSettleAccountId("");
  }

  function confirmSettle(withAccount: boolean) {
    if (!settleTarget) return;
    settleParticipant.mutate(
      {
        splitId: settleTarget.splitId,
        participantIndex: settleTarget.participantIndex,
        ...(withAccount && settleAccountId ? { accountId: settleAccountId } : {}),
      },
      { onSuccess: () => setSettleTarget(null) }
    );
  }

  function confirmDelete() {
    if (!deleteId) return;
    deleteSplit.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  }

  const allSettled = (s: Split) => s.participants.every((p) => p.isPaid);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-text-primary font-heading">Splits</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-white bg-accent px-3.5 py-2 rounded-full shadow-lg shadow-accent/30 hover:opacity-90 transition-opacity"
        >
          <Plus size={15} /> New Split
        </button>
      </div>

      {/* Balance summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-income/8 border border-income/20 rounded-card p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ArrowDownLeft size={13} className="text-income" />
              <span className="text-[11px] text-text-muted">Owed to you</span>
            </div>
            <p className="font-bold text-income font-heading text-sm">{formatCurrency(summary.youAreOwed)}</p>
          </div>
          <div className="bg-expense/8 border border-expense/20 rounded-card p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ArrowUpRight size={13} className="text-expense" />
              <span className="text-[11px] text-text-muted">You owe</span>
            </div>
            <p className="font-bold text-expense font-heading text-sm">{formatCurrency(summary.youOwe)}</p>
          </div>
          <div className="bg-bg-card border border-border rounded-card p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <HandCoins size={13} className="text-accent" />
              <span className="text-[11px] text-text-muted">Net</span>
            </div>
            <p className={`font-bold font-heading text-sm ${summary.net >= 0 ? "text-income" : "text-expense"}`}>
              {summary.net >= 0 ? "+" : ""}{formatCurrency(summary.net)}
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex bg-bg-elevated border border-border rounded-full p-0.5 gap-0.5 self-start w-fit">
        {(["all", "self", "friend"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
              filter === f ? "bg-accent text-white shadow-sm" : "text-text-muted hover:text-text-primary"
            }`}
          >
            {f === "self" ? "You paid" : f === "friend" ? "Friend paid" : "All"}
          </button>
        ))}
      </div>

      {/* Splits list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-32 rounded-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center">
            <HandCoins size={28} className="text-text-muted" />
          </div>
          <div className="text-center">
            <p className="text-text-primary font-medium">No splits yet</p>
            <p className="text-text-muted text-sm mt-1">Record a shared bill to track who owes what</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((split) => {
            const settled = allSettled(split);
            return (
              <div
                key={split._id}
                className={`bg-bg-card border rounded-card p-4 ${settled ? "border-border opacity-70" : "border-border"}`}
              >
                {/* Split header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-text-primary truncate">{split.title}</span>
                      {settled && (
                        <span className="text-[10px] font-bold text-income bg-income/10 border border-income/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          ✓ Settled
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-text-muted">{formatCurrency(split.totalAmount)}</span>
                      <span className="text-xs text-border">·</span>
                      <span className="text-xs text-text-muted">{split.category}</span>
                      <span className="text-xs text-border">·</span>
                      <span className="text-xs text-text-muted">
                        {split.paidBy === "self" ? "You paid" : `${split.friendName} paid`}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {new Date(split.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteId(split._id)}
                    className="p-1.5 text-text-muted hover:text-expense hover:bg-expense/10 rounded-lg transition-all flex-shrink-0 ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Participants */}
                <div className="space-y-2">
                  {split.participants.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-2">
                        {p.isPaid ? (
                          <CheckCircle2 size={15} className="text-income flex-shrink-0" />
                        ) : (
                          <Clock size={15} className="text-text-muted flex-shrink-0" />
                        )}
                        <span className={`text-sm ${p.isYou ? "font-semibold text-accent" : "text-text-primary"}`}>
                          {p.isYou ? "You" : p.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold font-heading text-text-primary">
                        {formatCurrency(p.share)}
                      </span>
                      {!p.isPaid && (
                        <button
                          onClick={() => openSettle(split, idx)}
                          className="text-xs font-semibold text-accent border border-accent/30 px-2.5 py-1 rounded-full hover:bg-accent/10 transition-colors flex-shrink-0"
                        >
                          Settle
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* My share callout (when I paid) */}
                {split.paidBy === "self" && (
                  <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                    <span className="text-xs text-text-muted">Your share</span>
                    <span className="text-xs font-semibold text-text-primary">
                      {formatCurrency(
                        split.totalAmount - split.participants.reduce((s, p) => s + p.share, 0)
                      )}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create sheet */}
      {showCreate && (
        <CreateSplitSheet onClose={() => setShowCreate(false)} onSuccess={() => setShowCreate(false)} />
      )}

      {/* Settle modal */}
      {settleTarget && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border rounded-t-2xl md:rounded-card w-full max-w-sm shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-primary font-heading">Settle up</h3>
              <button onClick={() => setSettleTarget(null)} className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="bg-bg-elevated rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-text-muted">
                {settleTarget.splitPaidBy === "self"
                  ? `${settleTarget.participantName} paid you back`
                  : `You paid ${settleTarget.participantName}`}
              </p>
              <p className="text-lg font-bold text-text-primary font-heading mt-0.5">
                {formatCurrency(settleTarget.share)}
              </p>
            </div>

            {accounts.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Record to account <span className="text-border font-normal">(optional)</span>
                </label>
                <select
                  value={settleAccountId}
                  onChange={(e) => setSettleAccountId(e.target.value)}
                  className="w-full bg-bg-base border border-border rounded-btn px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">Skip — just mark settled</option>
                  {accounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.bankName} ••{a.lastFiveDigits}
                    </option>
                  ))}
                </select>
                {settleAccountId && (
                  <p className="text-[11px] text-text-muted mt-1.5 px-1">
                    {settleTarget.splitPaidBy === "self"
                      ? "Auto-records as income (you received money)"
                      : "Auto-records as expense (you paid friend back)"}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => confirmSettle(!!settleAccountId)}
              disabled={settleParticipant.isPending}
              className="w-full py-2.5 rounded-btn bg-income text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {settleParticipant.isPending ? "Settling…" : settleAccountId ? "Settle + Record" : "Mark as Settled"}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border rounded-card p-6 w-full max-w-xs shadow-2xl">
            <p className="text-text-primary font-semibold text-center mb-1">Delete split?</p>
            <p className="text-text-muted text-sm text-center mb-5">This removes the split and all balances.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-btn border border-border text-sm font-medium text-text-muted">Cancel</button>
              <button
                onClick={confirmDelete}
                disabled={deleteSplit.isPending}
                className="flex-1 py-2.5 rounded-btn bg-expense text-white text-sm font-semibold disabled:opacity-50"
              >
                {deleteSplit.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
