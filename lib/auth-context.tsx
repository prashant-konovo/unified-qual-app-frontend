"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";

interface User {
  sub: string;
  email: string;
  username: string;
  groups: string[];
}

interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithCode: (code: string, redirectUri: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "auth_tokens";

function getStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeTokens(tokens: AuthTokens) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  // Set a cookie marker so the Next.js middleware can detect auth state server-side
  document.cookie = "auth_active=1; path=/; max-age=86400; SameSite=Lax";
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = "auth_active=; path=/; max-age=0";
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function extractUser(idToken: string): User | null {
  const claims = parseJwtPayload(idToken);
  if (!claims) return null;
  return {
    sub: (claims.sub as string) ?? "",
    email: (claims.email as string) ?? "",
    username: (claims["cognito:username"] as string) ?? "",
    groups: (claims["cognito:groups"] as string[]) ?? [],
  };
}

function isTokenExpired(token: string): boolean {
  const claims = parseJwtPayload(token);
  if (!claims?.exp) return true;
  return Date.now() >= (claims.exp as number) * 1000;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate user from stored token on mount
  useEffect(() => {
    const tokens = getStoredTokens();
    if (tokens?.idToken && !isTokenExpired(tokens.idToken)) {
      setUser(extractUser(tokens.idToken));
    } else if (tokens) {
      clearTokens();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiClient.post("/auth/login", { email, password });
      const data = res.data;

      // Central auth service returns tokens at the top level
      const tokens: AuthTokens = {
        idToken:
          data.IdToken ?? data.idToken ?? data.AuthenticationResult?.IdToken ?? "",
        accessToken:
          data.AccessToken ?? data.accessToken ?? data.AuthenticationResult?.AccessToken ?? "",
        refreshToken:
          data.RefreshToken ?? data.refreshToken ?? data.AuthenticationResult?.RefreshToken ?? "",
      };

      if (!tokens.idToken) {
        throw new Error("Login failed — no token returned");
      }

      storeTokens(tokens);
      const u = extractUser(tokens.idToken);
      setUser(u);
      router.push("/dashboard");
    },
    [router],
  );

  const loginWithCode = useCallback(
    async (code: string, redirectUri: string) => {
      const res = await apiClient.post("/auth/sso/callback", { code, redirectUri });
      const data = res.data;

      const tokens: AuthTokens = {
        idToken:
          data.IdToken ?? data.idToken ?? "",
        accessToken:
          data.AccessToken ?? data.accessToken ?? "",
        refreshToken:
          data.RefreshToken ?? data.refreshToken ?? "",
      };

      if (!tokens.idToken) {
        throw new Error("SSO login failed — no token returned");
      }

      storeTokens(tokens);
      const u = extractUser(tokens.idToken);
      setUser(u);
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  const getToken = useCallback((): string | null => {
    const tokens = getStoredTokens();
    if (!tokens?.idToken) return null;
    if (isTokenExpired(tokens.idToken)) {
      clearTokens();
      setUser(null);
      return null;
    }
    return tokens.idToken;
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, loginWithCode, logout, getToken }),
    [user, isLoading, login, loginWithCode, logout, getToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
