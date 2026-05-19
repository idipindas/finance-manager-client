import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SubmitHandler } from "react-hook-form";
import Button from "@/components/ui/Button";
import { useCreateAccount } from "@/hooks/useAccounts";

const schema = z.object({
  bankName: z.string().min(2, "Bank name required"),
  lastFiveDigits: z.string().length(5, "Must be exactly 5 digits").regex(/^\d+$/, "Digits only"),
  cardType: z.enum(["debit", "credit"]),
  balance: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().min(0).optional()
  ),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess: () => void;
}

const inputClass =
  "w-full bg-bg-card border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors";

export default function AddAccountForm({ onSuccess }: Props) {
  const { mutateAsync, isPending } = useCreateAccount();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { cardType: "debit" },
  });

  const cardType = watch("cardType");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await mutateAsync(data);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Bank Name</label>
        <input {...register("bankName")} className={inputClass} placeholder="e.g. HDFC Bank" />
        {errors.bankName && <p className="text-expense text-xs mt-1">{errors.bankName.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Last 5 Digits</label>
        <input {...register("lastFiveDigits")} className={inputClass} placeholder="12345" maxLength={5} />
        {errors.lastFiveDigits && <p className="text-expense text-xs mt-1">{errors.lastFiveDigits.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Card Type</label>
        <div className="flex gap-2">
          {(["debit", "credit"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue("cardType", type)}
              className={`flex-1 py-2.5 rounded-btn text-sm font-medium transition-all capitalize ${
                cardType === type
                  ? "bg-accent text-white"
                  : "bg-bg-card border border-border text-text-muted hover:border-accent"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Initial Balance (optional)</label>
        <input
          {...register("balance")}
          type="number"
          step="0.01"
          className={inputClass}
          placeholder="0.00"
        />
      </div>

      <Button type="submit" loading={isPending} className="w-full mt-2">
        Add Account
      </Button>
    </form>
  );
}
