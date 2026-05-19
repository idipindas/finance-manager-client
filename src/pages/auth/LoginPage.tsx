import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import { useLogin } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-btn px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:bg-white/8 transition-all";

export default function LoginPage() {
  const { mutate, isPending, error } = useLogin();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0d1a] via-[#1a0f3a] to-[#0a0d1a]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-violet shadow-lg shadow-accent/30 mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-heading">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your Finance Manager</p>
        </div>

        <div className="glass rounded-card p-6 shadow-2xl">
          <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className={inputClass}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-expense text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  className={`${inputClass} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-expense text-xs mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <p className="text-expense text-xs text-center bg-expense/10 rounded-btn py-2 px-3">
                {(error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Login failed"}
              </p>
            )}

            <Button type="submit" loading={isPending} className="w-full mt-2" size="lg">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-5">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent hover:text-accent/80 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
