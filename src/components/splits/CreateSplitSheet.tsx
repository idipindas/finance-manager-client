import { useState } from "react";
import { X, Plus, Trash2, Zap } from "lucide-react";
import { useCreateSplit } from "@/hooks/useSplits";
import { useFriends } from "@/hooks/useFriends";
import { useCategories } from "@/hooks/useCategories";
import type { CreateSplitPayload } from "@/api/splits.api";

interface Participant {
  name: string;
  share: string;
  isYou?: boolean;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const inputClass =
  "w-full bg-bg-base border border-border rounded-btn px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors";

export default function CreateSplitSheet({ onClose, onSuccess }: Props) {
  const { data: friends = [] } = useFriends();
  const { data: categories = [] } = useCategories();
  const createSplit = useCreateSplit();

  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState("Food");
  const [paidBy, setPaidBy] = useState<"self" | "friend">("self");
  const [paidByFriendName, setPaidByFriendName] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const [error, setError] = useState("");

  const total = parseFloat(totalAmount) || 0;
  const allocatedByFriends = participants
    .filter((p) => !p.isYou)
    .reduce((s, p) => s + (parseFloat(p.share) || 0), 0);
  const myShare =
    paidBy === "self"
      ? total - allocatedByFriends
      : (participants.find((p) => p.isYou)?.share ? parseFloat(participants.find((p) => p.isYou)!.share) : 0);
  const totalAllocated = participants.reduce((s, p) => s + (parseFloat(p.share) || 0), 0);

  function switchToPaidBy(next: "self" | "friend") {
    setPaidBy(next);
    if (next === "friend") {
      // ensure "You" participant exists
      if (!participants.find((p) => p.isYou)) {
        setParticipants((prev) => [{ name: "You", share: "", isYou: true }, ...prev]);
      }
    } else {
      // remove "You" participant
      setParticipants((prev) => prev.filter((p) => !p.isYou));
    }
  }

  function applyEqualSplit() {
    if (!total) return;
    const count = paidBy === "self" ? participants.length + 1 : participants.length;
    if (count === 0) return;
    const each = Math.floor((total / count) * 100) / 100;
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, share: String(each) }))
    );
  }

  function addFriend(name: string) {
    if (participants.find((p) => p.name === name)) return;
    setParticipants((prev) => [...prev, { name, share: "" }]);
    setShowFriendPicker(false);
  }

  function addCustom() {
    setParticipants((prev) => [...prev, { name: "", share: "" }]);
  }

  function updateParticipant(i: number, field: "name" | "share", value: string) {
    setParticipants((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }

  function removeParticipant(i: number) {
    setParticipants((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Enter a title");
    if (!total || total <= 0) return setError("Enter a valid amount");
    if (paidBy === "friend" && !paidByFriendName.trim()) return setError("Select who paid");
    if (participants.length === 0) return setError("Add at least one participant");

    const invalid = participants.find((p) => !p.name.trim() || !parseFloat(p.share));
    if (invalid) return setError("Fill in all participant names and shares");

    if (paidBy === "self" && myShare < 0)
      return setError("Participant shares exceed total amount");

    const payload: CreateSplitPayload = {
      title: title.trim(),
      totalAmount: total,
      paidBy,
      ...(paidBy === "friend" ? { friendName: paidByFriendName.trim() } : {}),
      participants: participants.map((p) => ({
        name: p.name.trim(),
        share: parseFloat(p.share),
        ...(p.isYou ? { isYou: true } : {}),
      })),
      category,
      date,
    };

    createSplit.mutate(payload, { onSuccess });
  }

  const addedNames = new Set(participants.map((p) => p.name));
  const availableFriends = friends.filter((f) => !addedNames.has(f.name));

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-card border border-border rounded-t-2xl md:rounded-card w-full max-w-lg shadow-2xl max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-bold text-text-primary font-heading">New Split</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Title + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-text-muted mb-1.5">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dinner, Tea, Movie…" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Total Amount (₹)</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0"
                inputMode="decimal"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {categories.length > 0
                ? categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)
                : ["Food", "Transport", "Entertainment", "Shopping", "Other"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
            </select>
          </div>

          {/* Who paid */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Who paid?</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => switchToPaidBy("self")}
                className={`flex-1 py-2.5 rounded-btn text-sm font-semibold border transition-all ${
                  paidBy === "self"
                    ? "bg-accent text-white border-accent"
                    : "border-border text-text-muted hover:text-text-primary"
                }`}
              >
                I paid
              </button>
              <button
                type="button"
                onClick={() => switchToPaidBy("friend")}
                className={`flex-1 py-2.5 rounded-btn text-sm font-semibold border transition-all ${
                  paidBy === "friend"
                    ? "bg-accent text-white border-accent"
                    : "border-border text-text-muted hover:text-text-primary"
                }`}
              >
                Friend paid
              </button>
            </div>
            {paidBy === "friend" && (
              <div className="mt-2 relative">
                <select
                  value={paidByFriendName}
                  onChange={(e) => setPaidByFriendName(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Who paid for everyone?</option>
                  {friends.map((f) => (
                    <option key={f._id} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-text-muted">
                {paidBy === "self" ? "Friends in this split" : "Everyone (including you)"}
              </label>
              {participants.length > 0 && total > 0 && (
                <button
                  type="button"
                  onClick={applyEqualSplit}
                  className="flex items-center gap-1 text-xs text-accent font-semibold hover:opacity-80 transition-opacity"
                >
                  <Zap size={11} /> Equal split
                </button>
              )}
            </div>

            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  {p.isYou ? (
                    <div className={`${inputClass} flex-1 text-text-muted bg-bg-elevated cursor-not-allowed`}>You</div>
                  ) : (
                    <input
                      value={p.name}
                      onChange={(e) => updateParticipant(i, "name", e.target.value)}
                      placeholder="Name"
                      className={`${inputClass} flex-1`}
                    />
                  )}
                  <input
                    type="number"
                    value={p.share}
                    onChange={(e) => updateParticipant(i, "share", e.target.value)}
                    placeholder="₹0"
                    inputMode="decimal"
                    className={`${inputClass} w-24`}
                  />
                  {!p.isYou && (
                    <button type="button" onClick={() => removeParticipant(i)} className="p-2 text-text-muted hover:text-expense rounded-lg hover:bg-expense/10 transition-all flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add participant buttons */}
            <div className="flex gap-2 mt-2">
              {availableFriends.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFriendPicker((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-accent border border-accent/30 px-3 py-1.5 rounded-full hover:bg-accent/10 transition-colors"
                  >
                    <Plus size={12} /> Add friend
                  </button>
                  {showFriendPicker && (
                    <div className="absolute z-10 top-8 left-0 bg-bg-elevated border border-border rounded-xl shadow-xl min-w-[140px] overflow-hidden">
                      {availableFriends.map((f) => (
                        <button
                          key={f._id}
                          type="button"
                          onClick={() => addFriend(f.name)}
                          className="w-full text-left px-3.5 py-2.5 text-sm text-text-primary hover:bg-accent/10 transition-colors"
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={addCustom}
                className="flex items-center gap-1.5 text-xs text-text-muted border border-border px-3 py-1.5 rounded-full hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                <Plus size={12} /> Custom name
              </button>
            </div>
          </div>

          {/* Summary */}
          {total > 0 && participants.length > 0 && (
            <div className="bg-bg-elevated rounded-xl px-4 py-3 space-y-1 text-xs">
              {paidBy === "self" && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Your share</span>
                  <span className={`font-semibold ${myShare < 0 ? "text-expense" : "text-text-primary"}`}>
                    ₹{myShare.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">Allocated</span>
                <span className={`font-semibold ${totalAllocated > total ? "text-expense" : "text-income"}`}>
                  ₹{totalAllocated.toFixed(2)} / ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {error && <p className="text-expense text-xs px-1">{error}</p>}

          <div className="flex gap-3 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-btn border border-border text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSplit.isPending}
              className="flex-1 py-2.5 rounded-btn bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createSplit.isPending ? "Saving…" : "Create Split"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
