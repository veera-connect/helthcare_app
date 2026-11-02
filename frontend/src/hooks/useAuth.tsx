import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { login, register, logout, storeTokens, getStoredTokens, parseJwt } from "../services/auth.service";
import type { Role, AuthTokens } from "../types";

interface AuthState {
  userId: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  user: { email?: string; doctor_id?: string; patient_id?: string } | null;
}

interface AuthContextValue extends AuthState {
  loginUser: (email: string, password: string) => Promise<void>;
  registerPatient: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseTokens(tokens: AuthTokens): AuthState {
  const payload = parseJwt(tokens.access_token);
  if (!payload) return { userId: null, role: null, isAuthenticated: false, user: null };
  return {
    userId: payload.sub,
    role: payload.role as Role,
    isAuthenticated: true,
    user: { email: payload.email, doctor_id: payload.doctor_id, patient_id: payload.patient_id },
  };
}

function getInitialState(): AuthState {
  const tokens = getStoredTokens();
  if (!tokens) return { userId: null, role: null, isAuthenticated: false, user: null };
  return parseTokens(tokens);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(getInitialState);

  const loginUser = useCallback(async (email: string, password: string) => {
    const tokens = await login({ email, password });
    storeTokens(tokens);
    setAuth(parseTokens(tokens));
  }, []);

  const registerPatient = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const tokens = await register({ email, password, first_name: firstName, last_name: lastName });
      storeTokens(tokens);
      setAuth(parseTokens(tokens));
    },
    []
  );

  const logoutUser = useCallback(() => {
    logout();
    setAuth({ userId: null, role: null, isAuthenticated: false, user: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, loginUser, registerPatient, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
