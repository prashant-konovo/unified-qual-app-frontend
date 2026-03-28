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

type UnifiedRole = "admin" | "manager" | "moderator" | "observer" | "external";

interface User {
  sub: string;
  email: string;
  username: string;
  groups: string[];
  roles: UnifiedRole[];
}

interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  loginWithCode: (code: string, redirectUri: string, redirectTo?: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  hasRole: (...roles: UnifiedRole[]) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isModerator: boolean;
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

// Maps Cognito groups to unified roles (must mirror backend middleware/roles.go)
const COGNITO_GROUP_TO_ROLE: Record<string, UnifiedRole> = {
  QUAL_SCHEDULER_ADMIN: "admin",
  ADMIN: "admin",
  AdminUsers: "admin",
  SHG_ADMIN: "admin",
  PANEL_ADMIN: "admin",
  QUAL_SCHEDULER_MANAGER: "manager",
  SUBSCRIPTION_OWNER: "manager",
  SUBSCRIPTION_ADMIN: "manager",
  QUAL_SCHEDULER_MODERATOR: "moderator",
  CLIENT_MODERATOR: "moderator",
  SUBSCRIPTION_USER: "observer",
  EXTERNAL_PANELIST_PROVIDER: "external",
  RESPONDER: "external",
  Responder: "external",
};

const ROLE_PRIORITY: Record<UnifiedRole, number> = {
  admin: 0,
  manager: 1,
  moderator: 2,
  observer: 3,
  external: 4,
};

function mapGroupsToRoles(groups: string[]): UnifiedRole[] {
  const seen = new Set<UnifiedRole>();
  for (const g of groups) {
    const role = COGNITO_GROUP_TO_ROLE[g];
    if (role) seen.add(role);
  }
  return Array.from(seen).sort((a, b) => ROLE_PRIORITY[a] - ROLE_PRIORITY[b]);
}

function extractUser(idToken: string): User | null {
  const claims = parseJwtPayload(idToken);
  if (!claims) return null;
  const groups = (claims["cognito:groups"] as string[]) ?? [];
  return {
    sub: (claims.sub as string) ?? "",
    email: (claims.email as string) ?? "",
    username: (claims["cognito:username"] as string) ?? "",
    groups,
    roles: mapGroupsToRoles(groups),
  };
}

// Role-based default landing page (mirrors legacy QS-Tool redirect logic)
function defaultRedirect(u: User | null): string {
  if (!u || u.roles.length === 0) return "/projects";
  const top = u.roles[0]; // highest-priority role
  if (top === "admin" || top === "manager") return "/projects";
  if (top === "moderator") return "/interviews";
  return "/interviews";
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
    async (email: string, password: string, redirectTo?: string) => {
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
      router.push(redirectTo || defaultRedirect(u));
    },
    [router],
  );

  const loginWithCode = useCallback(
    async (code: string, redirectUri: string, redirectTo?: string) => {
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
      router.push(redirectTo || defaultRedirect(u));
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

  const hasRole = useCallback(
    (...roles: UnifiedRole[]) => {
      if (!user) return false;
      return roles.some((r) => user.roles.includes(r));
    },
    [user],
  );

  const isAdmin = useMemo(() => hasRole("admin"), [hasRole]);
  const isManager = useMemo(() => hasRole("manager"), [hasRole]);
  const isModerator = useMemo(() => hasRole("moderator"), [hasRole]);

  const value = useMemo(
    () => ({ user, isLoading, login, loginWithCode, logout, getToken, hasRole, isAdmin, isManager, isModerator }),
    [user, isLoading, login, loginWithCode, logout, getToken, hasRole, isAdmin, isManager, isModerator],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
