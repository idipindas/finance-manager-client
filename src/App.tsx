import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import axios from "axios";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { setAuth, setAccessToken, accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) return;
    const rt = localStorage.getItem("refreshToken");
    if (!rt) return;
    axios
      .post("http://localhost:5000/api/auth/refresh", { refreshToken: rt })
      .then(({ data }) => {
        if (data.user) {
          setAuth(data.accessToken, data.user);
        } else {
          setAccessToken(data.accessToken);
        }
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      })
      .catch(() => localStorage.removeItem("refreshToken"));
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
