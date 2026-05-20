import { NavLink } from "react-router-dom";
import { LayoutDashboard, Wallet, TrendingDown, TrendingUp, Tag, BarChart2, PiggyBank, Users, HandCoins, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/accounts", icon: Wallet, label: "Accounts" },
  { to: "/expenses", icon: TrendingDown, label: "Expenses" },
  { to: "/incomes", icon: TrendingUp, label: "Incomes" },
  { to: "/budgets", icon: PiggyBank, label: "Budgets" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/splits", icon: HandCoins, label: "Splits" },
  { to: "/friends", icon: Users, label: "Friends" },
  { to: "/categories", icon: Tag, label: "Categories" },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-bg-card border-r border-border min-h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-border [app-region:drag] [-webkit-app-region:drag]">
        <div className="flex items-center gap-2.5 [-webkit-app-region:no-drag]">
          <div className="w-8 h-8 rounded-lg gradient-violet flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-heading font-bold text-text-primary tracking-tight">Finance</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-accent/15 text-accent"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-elevated"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-expense hover:bg-expense/10 transition-all"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
