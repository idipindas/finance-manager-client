import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { useAccounts, useDeleteAccount } from "@/hooks/useAccounts";
import AccountCard from "@/components/cards/AccountCard";
import Modal from "@/components/ui/Modal";
import BottomSheet from "@/components/ui/BottomSheet";
import AddAccountForm from "@/components/forms/AddAccountForm";
import Button from "@/components/ui/Button";

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts();
  const deleteAccount = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const isMobile = window.innerWidth < 768;
  const SheetOrModal = isMobile ? BottomSheet : Modal;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Accounts</h1>
          <p className="text-text-muted text-sm mt-0.5">{accounts.length} account{accounts.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus size={16} /> Add Account
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer h-36 rounded-card" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <Wallet size={28} className="text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary font-heading mb-2">No accounts yet</h3>
          <p className="text-text-muted text-sm mb-6">Add your first bank account to get started</p>
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Add Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accounts.map((a) => (
            <AccountCard
              key={a._id}
              account={a}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <SheetOrModal open={open} onClose={() => setOpen(false)} title="Add Account">
        <AddAccountForm onSuccess={() => setOpen(false)} />
      </SheetOrModal>

      {/* Delete confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Account">
        <p className="text-text-muted text-sm mb-5">
          Are you sure you want to delete this account? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={deleteAccount.isPending}
            onClick={() => {
              if (deleteId) deleteAccount.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
