import { apiClient } from "./api";
import type { AuthTokens } from "../types";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export async function login(data: LoginData): Promise<AuthTokens> {
  const res = await apiClient.post<AuthTokens>("/auth/login", data);
  return res.data;
}

export async function register(data: RegisterData): Promise<AuthTokens> {
  const res = await apiClient.post<AuthTokens>("/auth/register", data);
  return res.data;
}

export function logout() {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
}

export function getStoredTokens(): AuthTokens | null {
  const access_token = sessionStorage.getItem("access_token");
  const refresh_token = sessionStorage.getItem("refresh_token");
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token, token_type: "bearer" };
}

export function storeTokens(tokens: AuthTokens) {
  sessionStorage.setItem("access_token", tokens.access_token);
  sessionStorage.setItem("refresh_token", tokens.refresh_token);
}

export function parseJwt(token: string): { sub: string; role: string; exp: number } | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
