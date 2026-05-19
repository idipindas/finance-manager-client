import { NavLink } from "react-router-dom";
import { LayoutDashboard, Wallet, TrendingDown, TrendingUp, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/accounts", icon: Wallet, label: "Accounts" },
  { to: "/expenses", icon: TrendingDown, label: "Expenses" },
  { to: "/incomes", icon: TrendingUp, label: "Incomes" },
  { to: "/categories", icon: Tag, label: "Categories" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-bg-card border-t border-border safe-area-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
                isActive ? "text-accent" : "text-text-muted"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
