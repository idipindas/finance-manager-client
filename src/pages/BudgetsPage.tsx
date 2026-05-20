import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Check,
  X,
  PiggyBank,
} from "lucide-react";
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency } from "@/lib/utils";
import type { Budget } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function progressColor(pct: number, isOver: boolean) {
  if (isOver || pct >= 100) return "bg-expense";
  if (pct >= 80) return "bg-amber-400";
  return "bg-income";
}

function progressBg(pct: number, isOver: boolean) {
  if (isOver || pct >= 100) return "text-expense border-expense/20 bg-expense/8";
  if (pct >= 80) return "text-amber-400 border-amber-400/20 bg-amber-400/8";
  return "text-income border-income/20 bg-income/8";
}

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: budgets = [], isLoading } = useBudgets(month, year);
  const { data: categories = [] } = useCategories();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const usedCategories = new Set(budgets.map((b) => b.category));
  const availableCategories = categories.filter((c) => !usedCategories.has(c.name));

  const totalLimit = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudgetCount = budgets.filter((b) => b.isOverBudget).length;

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function startEdit(b: Budget) {
    setEditId(b._id);
    setEditValue(String(b.monthlyLimit));
  }

  function confirmEdit() {
    if (!editId) return;
    const val = Number(editValue);
    if (!val || val <= 0) return;
    updateBudget.mutate({ id: editId, monthlyLimit: val }, { onSuccess: () => setEditId(null) });
  }

  function confirmDelete() {
    if (!deleteId) return;
    deleteBudget.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-text-primary font-heading">Budgets</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-white bg-accent px-3.5 py-2 rounded-full shadow-lg shadow-accent/30 hover:opacity-90 transition-opacity"
        >
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-between bg-bg-card border border-border rounded-card px-4 py-3">
        <button onClick={prevMonth} className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-elevated">
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-text-primary text-sm">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button onClick={nextMonth} className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-elevated">
          <ChevronRight size={18} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-28 rounded-card" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <PiggyBank size={30} className="text-accent" />
          </div>
          <div className="text-center">
            <p className="text-text-primary font-medium">No budgets for this month</p>
            <p className="text-text-muted text-sm mt-1">Set spending limits per category</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-accent px-5 py-2.5 rounded-full shadow-lg shadow-accent/30"
          >
            <Plus size={15} /> Create first budget
          </button>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          {budgets.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-bg-card border border-border rounded-card p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Total limit</p>
                <p className="font-bold text-text-primary font-heading text-sm">{formatCurrency(totalLimit)}</p>
              </div>
              <div className="bg-bg-card border border-border rounded-card p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Total spent</p>
                <p className="font-bold text-expense font-heading text-sm">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="bg-bg-card border border-border rounded-card p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Over budget</p>
                <p className={`font-bold font-heading text-sm ${overBudgetCount > 0 ? "text-expense" : "text-income"}`}>
                  {overBudgetCount} cat{overBudgetCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Budget cards */}
          <div className="space-y-3">
            {budgets.map((b) => {
              const pct = Math.min(b.percentage, 100);
              const isEditing = editId === b._id;
              const barColor = progressColor(b.percentage, b.isOverBudget);

              return (
                <div key={b._id} className="bg-bg-card border border-border rounded-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{b.category}</span>
                        {b.isOverBudget && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-expense bg-expense/10 border border-expense/20 px-1.5 py-0.5 rounded-full">
                            <AlertTriangle size={9} /> Over
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm font-bold font-heading text-text-primary">
                          {formatCurrency(b.spent)}
                        </span>
                        <span className="text-xs text-text-muted">/</span>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              autoFocus
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") setEditId(null); }}
                              className="w-24 bg-bg-base border border-accent rounded-lg px-2 py-0.5 text-sm text-text-primary focus:outline-none"
                            />
                            <button onClick={confirmEdit} className="text-income hover:opacity-80 p-0.5">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditId(null)} className="text-text-muted hover:text-text-primary p-0.5">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">{formatCurrency(b.monthlyLimit)}</span>
                        )}
                      </div>
                    </div>
                    {!isEditing && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => startEdit(b)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteId(b._id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-bg-elevated rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Status line */}
                  <div className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border inline-flex items-center gap-1.5 ${progressBg(b.percentage, b.isOverBudget)}`}>
                    {b.isOverBudget ? (
                      <>
                        <AlertTriangle size={11} />
                        Over by {formatCurrency(Math.abs(b.remaining))}
                      </>
                    ) : (
                      <>{formatCurrency(b.remaining)} remaining · {b.percentage}% used</>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Budget modal */}
      {showAdd && (
        <AddBudgetModal
          categories={availableCategories.map((c) => c.name)}
          month={month}
          year={year}
          onClose={() => setShowAdd(false)}
          onCreate={(data) =>
            createBudget.mutate(data, { onSuccess: () => setShowAdd(false) })
          }
          isPending={createBudget.isPending}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border rounded-card p-6 w-full max-w-xs shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-expense/10 flex items-center justify-center mb-4 mx-auto">
              <Trash2 size={20} className="text-expense" />
            </div>
            <p className="text-text-primary font-semibold text-center mb-1">Delete budget?</p>
            <p className="text-text-muted text-sm text-center mb-5">This will remove the spending limit for this category.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-btn border border-border text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteBudget.isPending}
                className="flex-1 py-2.5 rounded-btn bg-expense text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {deleteBudget.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AddBudgetModalProps {
  categories: string[];
  month: number;
  year: number;
  onClose: () => void;
  onCreate: (data: { category: string; monthlyLimit: number; month: number; year: number }) => void;
  isPending: boolean;
}

function AddBudgetModal({ categories, month, year, onClose, onCreate, isPending }: AddBudgetModalProps) {
  const [category, setCategory] = useState(categories[0] ?? "");
  const [customCategory, setCustomCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [useCustom, setUseCustom] = useState(categories.length === 0);

  const finalCategory = useCustom ? customCategory.trim() : category;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = Number(limit);
    if (!finalCategory || !val || val <= 0) return;
    onCreate({ category: finalCategory, monthlyLimit: val, month, year });
  }

  const inputClass =
    "w-full bg-bg-base border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-card border border-border rounded-t-2xl md:rounded-card w-full max-w-md shadow-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-text-primary font-heading">New Budget</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Category</label>
            {!useCustom && categories.length > 0 ? (
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass + " flex-1"}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setUseCustom(true)}
                  className="text-xs text-accent border border-accent/30 px-3 rounded-btn hover:bg-accent/10 transition-colors flex-shrink-0"
                >
                  Custom
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Dining, Gym"
                  className={inputClass + " flex-1"}
                />
                {categories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseCustom(false)}
                    className="text-xs text-text-muted border border-border px-3 rounded-btn hover:bg-bg-elevated transition-colors flex-shrink-0"
                  >
                    Pick
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Monthly Limit (₹)</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="5000"
              inputMode="numeric"
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-btn border border-border text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !finalCategory || !limit}
              className="flex-1 py-2.5 rounded-btn bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
