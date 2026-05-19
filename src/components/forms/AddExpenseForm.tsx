import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SubmitHandler } from "react-hook-form";
import Button from "@/components/ui/Button";
import { useCreateExpense } from "@/hooks/useExpenses";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories, useSuggestCategory } from "@/hooks/useCategories";

const schema = z.object({
  accountId: z.string().min(1, "Select an account"),
  amount: z.preprocess((v) => Number(v), z.number().positive("Enter a valid amount")),
  category: z.string().min(1, "Enter a category"),
  description: z.string().optional(),
  date: z.string().min(1, "Select a date"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess: () => void;
  defaultAccountId?: string;
  prefill?: {
    amount?: number;
    category?: string;
    description?: string;
    date?: string;
  };
}

const inputClass =
  "w-full bg-bg-card border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors";

export default function AddExpenseForm({ onSuccess, defaultAccountId, prefill }: Props) {
  const { mutateAsync, isPending } = useCreateExpense();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { mutateAsync: suggest } = useSuggestCategory();
  const [catSearch, setCatSearch] = useState(prefill?.category ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      accountId: defaultAccountId ?? "",
      date: prefill?.date ?? new Date().toISOString().split("T")[0],
      amount: prefill?.amount,
      category: prefill?.category ?? "",
      description: prefill?.description ?? "",
    },
  });

  const selectedCat = watch("category");

  const filteredCats = categories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  const handleCatSelect = (name: string) => {
    setValue("category", name);
    setCatSearch(name);
    setShowSuggestions(false);
  };

  const handleCatAdd = async () => {
    if (!catSearch.trim()) return;
    const res = await suggest(catSearch.trim());
    handleCatSelect(res.data.name);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await mutateAsync(data);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Amount</label>
        <input
          {...register("amount")}
          type="number"
          step="0.01"
          inputMode="decimal"
          className={inputClass}
          placeholder="0.00"
        />
        {errors.amount && <p className="text-expense text-xs mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Account</label>
        <select {...register("accountId")} className={inputClass}>
          <option value="">Select account</option>
          {accounts.map((a) => (
            <option key={a._id} value={a._id}>
              {a.bankName} ••{a.lastFiveDigits}
            </option>
          ))}
        </select>
        {errors.accountId && <p className="text-expense text-xs mt-1">{errors.accountId.message}</p>}
      </div>

      <div className="relative">
        <label className="block text-xs font-medium text-text-muted mb-1.5">Category</label>
        <input
          value={catSearch}
          onChange={(e) => {
            setCatSearch(e.target.value);
            setValue("category", e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className={inputClass}
          placeholder="Search or add category"
        />
        {showSuggestions && catSearch && (
          <div className="absolute z-10 w-full mt-1 bg-bg-elevated border border-border rounded-btn shadow-xl max-h-40 overflow-y-auto">
            {filteredCats.map((c) => (
              <button
                key={c._id}
                type="button"
                onMouseDown={() => handleCatSelect(c.name)}
                className="w-full text-left px-3.5 py-2 text-sm text-text-primary hover:bg-accent/10 transition-colors"
              >
                {c.name}
              </button>
            ))}
            {catSearch && !filteredCats.find((c) => c.name.toLowerCase() === catSearch.toLowerCase()) && (
              <button
                type="button"
                onMouseDown={handleCatAdd}
                className="w-full text-left px-3.5 py-2 text-sm text-accent hover:bg-accent/10 transition-colors border-t border-border"
              >
                + Add "{catSearch}"
              </button>
            )}
          </div>
        )}
        <input type="hidden" {...register("category")} value={selectedCat} />
        {errors.category && <p className="text-expense text-xs mt-1">{errors.category.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Description (optional)</label>
        <input {...register("description")} className={inputClass} placeholder="What was this for?" />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Date</label>
        <input {...register("date")} type="date" className={inputClass} />
        {errors.date && <p className="text-expense text-xs mt-1">{errors.date.message}</p>}
      </div>

      <Button type="submit" loading={isPending} className="w-full mt-2">
        Add Expense
      </Button>
    </form>
  );
}
