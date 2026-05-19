import axios from "axios";
import type { AuthResponse } from "@/types";

const BASE = "http://localhost:5000/api/auth";

// Backend returns { success, accessToken, refreshToken, user } directly (no nested `data`)
export const registerUser = (data: { name: string; email: string; password: string }) =>
  axios.post<AuthResponse>(`${BASE}/register`, data).then((r) => r.data);

export const loginUser = (data: { email: string; password: string }) =>
  axios.post<AuthResponse>(`${BASE}/login`, data).then((r) => r.data);

export const logoutUser = (refreshToken: string) =>
  axios.post(`${BASE}/logout`, { refreshToken });
