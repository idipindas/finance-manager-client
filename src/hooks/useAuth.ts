import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser, registerUser, logoutUser } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      localStorage.setItem("refreshToken", data.refreshToken);
      const from = (location.state as { from?: string })?.from ?? "/";
      navigate(from, { replace: true });
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      localStorage.setItem("refreshToken", data.refreshToken);
      const from = (location.state as { from?: string })?.from ?? "/";
      navigate(from, { replace: true });
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  return () => {
    const rt = localStorage.getItem("refreshToken");
    if (rt) logoutUser(rt).catch(() => {});
    clearAuth();
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };
}
