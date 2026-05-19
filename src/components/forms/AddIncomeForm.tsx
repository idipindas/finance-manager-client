import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SubmitHandler } from "react-hook-form";
import Button from "@/components/ui/Button";
import { useCreateIncome } from "@/hooks/useIncomes";
import { useAccounts } from "@/hooks/useAccounts";

const schema = z.object({
  accountId: z.string().min(1, "Select an account"),
  amount: z.preprocess((v) => Number(v), z.number().positive("Enter a valid amount")),
  source: z.string().min(1, "Enter income source"),
  description: z.string().optional(),
  date: z.string().min(1, "Select a date"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess: () => void;
  defaultAccountId?: string;
}

const inputClass =
  "w-full bg-bg-card border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors";

export default function AddIncomeForm({ onSuccess, defaultAccountId }: Props) {
  const { mutateAsync, isPending } = useCreateIncome();
  const { data: accounts = [] } = useAccounts();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      accountId: defaultAccountId ?? "",
      date: new Date().toISOString().split("T")[0],
    },
  });

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

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Source</label>
        <input {...register("source")} className={inputClass} placeholder="e.g. Salary, Freelance" />
        {errors.source && <p className="text-expense text-xs mt-1">{errors.source.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Description (optional)</label>
        <input {...register("description")} className={inputClass} placeholder="Additional details" />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Date</label>
        <input {...register("date")} type="date" className={inputClass} />
        {errors.date && <p className="text-expense text-xs mt-1">{errors.date.message}</p>}
      </div>

      <Button type="submit" loading={isPending} className="w-full mt-2">
        Add Income
      </Button>
    </form>
  );
}
