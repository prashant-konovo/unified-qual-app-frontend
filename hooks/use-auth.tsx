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

import type { AuthContextValue, AuthTokens, UnifiedRole, User } from "@/lib/auth-types";
import {
  REFRESH_BUFFER_MS,
  clearAuth,
  defaultRedirect,
  extractTokensFromResponse,
  extractUser,
  getStoredICCredentials,
  getStoredTokens,
  isTokenExpired,
  storeICCredentials,
  storeTokens,
  tokenExpiresIn,
} from "@/lib/token-manager";

// Re-export types for backward compatibility
export type { UnifiedRole, User, AuthTokens, ICCredentials, AuthContextValue } from "@/lib/auth-types";

const AuthContext = createContext<AuthContextValue | null>(null);

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
