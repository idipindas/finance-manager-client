import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "income" | "expense" | "debit" | "credit" | "default";
  className?: string;
}

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    income: "bg-income/15 text-income",
    expense: "bg-expense/15 text-expense",
    debit: "bg-blue-500/15 text-blue-400",
    credit: "bg-purple-500/15 text-purple-400",
    default: "bg-accent/15 text-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
