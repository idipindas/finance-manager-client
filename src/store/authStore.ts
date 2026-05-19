import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isRestoring: boolean; // true while checking localStorage refreshToken on page load
  setAuth: (accessToken: string, user: User) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setRestored: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isRestoring: true,
  setAuth: (accessToken, user) => set({ accessToken, user, isRestoring: false }),
  setAccessToken: (token) => set({ accessToken: token, isRestoring: false }),
  clearAuth: () => set({ accessToken: null, user: null, isRestoring: false }),
  setRestored: () => set({ isRestoring: false }),
}));
