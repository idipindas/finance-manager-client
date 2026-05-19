import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser, logoutUser } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      localStorage.setItem("refreshToken", data.refreshToken);
      navigate("/");
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      localStorage.setItem("refreshToken", data.refreshToken);
      navigate("/");
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
