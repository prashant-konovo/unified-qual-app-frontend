"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";

type UnifiedRole = "admin" | "manager" | "moderator" | "observer" | "external";

interface User {
  id: number | null;
  sub: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  groups: string[];
  roles: UnifiedRole[];
}

interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

interface ICCredentials {
  icUserId: number;
  icAuthToken: string;
  apiKey: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, termsAccepted?: boolean, redirectTo?: string) => Promise<void>;
  loginWithCode: (code: string, redirectUri: string, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => string | null;
  hasRole: (...roles: UnifiedRole[]) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "auth_tokens";
const IC_CREDS_KEY = "ic_credentials";

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
  document.cookie = "auth_active=1; path=/; max-age=86400; SameSite=Lax";
}

function getStoredICCredentials(): ICCredentials | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(IC_CREDS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeICCredentials(creds: ICCredentials) {
  localStorage.setItem(IC_CREDS_KEY, JSON.stringify(creds));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(IC_CREDS_KEY);
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

function extractUser(idToken: string, userInfo?: Record<string, unknown>): User | null {
  const claims = parseJwtPayload(idToken);
  if (!claims) return null;
  const groups = (claims["cognito:groups"] as string[]) ?? [];
  return {
    id: (userInfo?.id as number) ?? null,
    sub: (claims.sub as string) ?? "",
    email: (claims.email as string) ?? (userInfo?.email as string) ?? "",
    username: (claims["cognito:username"] as string) ?? "",
    firstName: (userInfo?.firstName as string) ?? "",
    lastName: (userInfo?.lastName as string) ?? "",
    groups,
    roles: mapGroupsToRoles(groups),
  };
}

function defaultRedirect(u: User | null): string {
  if (!u || u.roles.length === 0) return "/projects";
  const top = u.roles[0];
  if (top === "admin" || top === "manager") return "/projects";
  if (top === "moderator") return "/interviews";
  return "/interviews";
}

function isTokenExpired(token: string): boolean {
  const claims = parseJwtPayload(token);
  if (!claims?.exp) return true;
  return Date.now() >= (claims.exp as number) * 1000;
}

function tokenExpiresIn(token: string): number {
  const claims = parseJwtPayload(token);
  if (!claims?.exp) return 0;
  return (claims.exp as number) * 1000 - Date.now();
}

/**
 * Extracts tokens from the nested backend response.
 * Handles both InCrowdAPI path and Cognito fallback path.
 */
function extractTokensFromResponse(data: Record<string, unknown>): {
  tokens: AuthTokens;
  userInfo: Record<string, unknown>;
  icCreds: ICCredentials | null;
} {
  // Navigate the nested envelope: data.body.body
  const outerBody = (data.body as Record<string, unknown>) ?? data;
  const innerBody = (outerBody.body as Record<string, unknown>) ?? outerBody;

  const userInfo = (innerBody.userInfo as Record<string, unknown>) ?? {};

  // Tokens can be at innerBody level (added for convenience) or in userInfo
  const idToken =
    (innerBody.IdToken as string) ??
    (userInfo.IdToken as string) ??
    (data.IdToken as string) ??
    "";

  const accessToken =
    (innerBody.AccessToken as string) ??
    (userInfo.AccessToken as string) ??
    (data.AccessToken as string) ??
    "";

  const refreshToken =
    (innerBody.RefreshToken as string) ??
    (userInfo.RefreshToken as string) ??
    (data.RefreshToken as string) ??
    "";

  // IC credentials for token refresh via InCrowdAPI
  const icUserId = (innerBody.icUserId as number) ?? 0;
  const icAuthToken = (innerBody.icAuthToken as string) ?? "";
  const apiKey = (innerBody.apiKey as string) ?? "";

  return {
    tokens: { idToken, accessToken, refreshToken },
    userInfo,
    icCreds: icUserId > 0 ? { icUserId, icAuthToken, apiKey } : null,
  };
}

// Refresh buffer: refresh 5 minutes before expiry
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Schedule automatic token refresh
  const scheduleRefresh = useCallback(
    (idToken: string) => {
      clearRefreshTimer();
      const expiresIn = tokenExpiresIn(idToken);
      const refreshIn = Math.max(expiresIn - REFRESH_BUFFER_MS, 30_000);

      refreshTimerRef.current = setTimeout(async () => {
        try {
          const icCreds = getStoredICCredentials();
          const storedTokens = getStoredTokens();
          const res = await apiClient.post("/auth/refresh", {
            refreshToken: storedTokens?.refreshToken ?? "",
            icUserId: icCreds?.icUserId ?? 0,
            icAuthToken: icCreds?.icAuthToken ?? "",
          });

          const newIdToken =
            res.data?.IdToken ?? res.data?.idToken ?? "";
          const newAccessToken =
            res.data?.AccessToken ?? res.data?.accessToken ?? icCreds?.icAuthToken ?? "";

          if (newIdToken) {
            const updatedTokens: AuthTokens = {
              idToken: newIdToken,
              accessToken: newAccessToken,
              refreshToken: storedTokens?.refreshToken ?? "",
            };
            storeTokens(updatedTokens);
            setUser(extractUser(newIdToken));
            scheduleRefresh(newIdToken);
          }
        } catch {
          // Refresh failed — user will be redirected on next 401
          clearAuth();
          setUser(null);
          router.push("/login");
        }
      }, refreshIn);
    },
    [clearRefreshTimer, router],
  );

  // Hydrate user from stored token on mount
  useEffect(() => {
    const tokens = getStoredTokens();
    if (tokens?.idToken && !isTokenExpired(tokens.idToken)) {
      setUser(extractUser(tokens.idToken));
      scheduleRefresh(tokens.idToken);
    } else if (tokens) {
      clearAuth();
    }
    setIsLoading(false);
  }, [scheduleRefresh]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearRefreshTimer();
  }, [clearRefreshTimer]);

  const login = useCallback(
    async (email: string, password: string, termsAccepted?: boolean, redirectTo?: string) => {
      const res = await apiClient.post("/auth/login", {
        email,
        password,
        ...(termsAccepted !== undefined && { termsAccepted }),
      });
      const data = res.data;

      // Handle terms acceptance required (HTTP 203)
      if (res.status === 203 && data?.termsAcceptedRes) {
        const error = new Error("Terms acceptance required");
        (error as Error & { termsRequired: boolean; userId: number }).termsRequired = true;
        (error as Error & { termsRequired: boolean; userId: number }).userId = data.termsAcceptedRes.userId;
        throw error;
      }

      const { tokens, userInfo, icCreds } = extractTokensFromResponse(data);

      if (!tokens.idToken) {
        throw new Error("Login failed — no token returned");
      }

      storeTokens(tokens);
      if (icCreds) storeICCredentials(icCreds);

      const u = extractUser(tokens.idToken, userInfo);
      setUser(u);
      scheduleRefresh(tokens.idToken);
      router.push(redirectTo || defaultRedirect(u));
    },
    [router, scheduleRefresh],
  );

  const loginWithCode = useCallback(
    async (code: string, redirectUri: string, redirectTo?: string) => {
      const res = await apiClient.post("/auth/sso/callback", { code, redirectUri });
      const data = res.data;

      const { tokens, userInfo, icCreds } = extractTokensFromResponse(data);

      if (!tokens.idToken) {
        throw new Error("SSO login failed — no token returned");
      }

      storeTokens(tokens);
      if (icCreds) storeICCredentials(icCreds);

      const u = extractUser(tokens.idToken, userInfo);
      setUser(u);
      scheduleRefresh(tokens.idToken);
      router.push(redirectTo || defaultRedirect(u));
    },
    [router, scheduleRefresh],
  );

  const logout = useCallback(async () => {
    clearRefreshTimer();
    try {
      const icCreds = getStoredICCredentials();
      if (icCreds?.icUserId) {
        await apiClient.post("/auth/logout", {
          icUserId: icCreds.icUserId,
          icAuthToken: icCreds.icAuthToken,
        });
      }
    } catch {
      // Best effort — still clear local state
    }
    clearAuth();
    setUser(null);
    router.push("/login");
  }, [router, clearRefreshTimer]);

  const getToken = useCallback((): string | null => {
    const tokens = getStoredTokens();
    if (!tokens?.idToken) return null;
    if (isTokenExpired(tokens.idToken)) {
      clearAuth();
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
