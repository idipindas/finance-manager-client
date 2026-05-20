import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import AppShell from "@/components/layout/AppShell";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import AccountsPage from "@/pages/AccountsPage";
import ExpensesPage from "@/pages/ExpensesPage";
import IncomesPage from "@/pages/IncomesPage";
import CategoriesPage from "@/pages/CategoriesPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import BudgetsPage from "@/pages/BudgetsPage";
import FriendsPage from "@/pages/FriendsPage";
import SplitsPage from "@/pages/SplitsPage";
import ShareTargetPage from "@/pages/ShareTargetPage";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { loadUser } from "@/hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  const isRestoring = useAuthStore((s) => s.isRestoring);
  const location = useLocation();

  // Still attempting to restore from localStorage — hold the redirect
  if (isRestoring) {
    return (
      <div className="min-h-dvh bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted text-sm">Restoring session…</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { setAuth, setAccessToken, setRestored, accessToken } = useAuthStore();

  useEffect(() => {
    // If we already have a token (shouldn't happen on fresh load but guard anyway)
    if (accessToken) {
      setRestored();
      return;
    }

    const rt = localStorage.getItem("refreshToken");
    if (!rt) {
      setRestored(); // no token in storage — done restoring, send to login
      return;
    }

    axios
      .post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken: rt })
      .then(({ data }) => {
        const user = data.user ?? loadUser();
        if (user) {
          setAuth(data.accessToken, user);
        } else {
          setAccessToken(data.accessToken);
        }
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      })
      .catch(() => {
        localStorage.removeItem("refreshToken");
        setRestored(); // refresh failed — send to login
      });
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/incomes" element={<IncomesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/splits" element={<SplitsPage />} />
         <Route
        path="/share-target"
        element={
            <ShareTargetPage />
        }
      />
      </Route>
     
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
