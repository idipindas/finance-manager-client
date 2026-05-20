import { useState, useRef } from "react";
import { UserPlus, Trash2, Users, Loader2 } from "lucide-react";
import { useFriends, useAddFriend, useDeleteFriend } from "@/hooks/useFriends";

export default function FriendsPage() {
  const { data: friends = [], isLoading } = useFriends();
  const addFriend = useAddFriend();
  const deleteFriend = useDeleteFriend();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError("");
    addFriend.mutate(trimmed, {
      onSuccess: () => {
        setName("");
        inputRef.current?.focus();
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "";
        setError(msg.toLowerCase().includes("already") ? `"${trimmed}" is already in your list` : "Failed to add friend");
      },
    });
  }

  function getInitial(n: string) {
    return n.trim()[0]?.toUpperCase() ?? "?";
  }

  const avatarColors = [
    "bg-accent/20 text-accent",
    "bg-income/20 text-income",
    "bg-amber-400/20 text-amber-400",
    "bg-cyan-400/20 text-cyan-400",
    "bg-pink-400/20 text-pink-400",
  ];

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-text-primary font-heading">Friends</h1>
        <p className="text-text-muted text-sm mt-0.5">Saved names for splitting bills</p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="Friend's name e.g. Rahul"
            className="flex-1 bg-bg-card border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={!name.trim() || addFriend.isPending}
            className="flex items-center gap-1.5 bg-accent text-white px-4 py-2.5 rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0"
          >
            {addFriend.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <UserPlus size={15} />
            )}
            Add
          </button>
        </div>
        {error && <p className="text-expense text-xs px-1">{error}</p>}
      </form>

      {/* Friends list */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-14 rounded-card" />)}
        </div>
      ) : friends.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center">
            <Users size={28} className="text-text-muted" />
          </div>
          <div className="text-center">
            <p className="text-text-primary font-medium">No friends added yet</p>
            <p className="text-text-muted text-sm mt-1">Add names to reuse them when splitting bills</p>
          </div>
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-card divide-y divide-border overflow-hidden">
          {friends.map((friend, i) => (
            <div key={friend._id} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                {getInitial(friend.name)}
              </div>
              <span className="flex-1 text-sm font-medium text-text-primary">{friend.name}</span>
              <button
                onClick={() => deleteFriend.mutate(friend._id)}
                disabled={deleteFriend.isPending}
                className="p-2 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-all"
                aria-label={`Remove ${friend.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {friends.length > 0 && (
        <p className="text-center text-xs text-text-muted">
          {friends.length} friend{friends.length !== 1 ? "s" : ""} saved
        </p>
      )}
    </div>
  );
}
