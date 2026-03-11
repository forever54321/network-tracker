import api from "./api";
import { TokenResponse } from "@/types";

export async function login(
  username: string,
  password: string
): Promise<TokenResponse> {
  const res = await api.post("/api/auth/login", { username, password });
  const data: TokenResponse = res.data;
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  return data;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}
