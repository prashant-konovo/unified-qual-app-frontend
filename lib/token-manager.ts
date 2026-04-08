import type { AuthTokens, ICCredentials, UnifiedRole, User } from "./auth-types";

const TOKEN_KEY = "auth_tokens";
const IC_CREDS_KEY = "ic_credentials";

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeTokens(tokens: AuthTokens) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  document.cookie = "auth_active=1; path=/; max-age=86400; SameSite=Lax";
}

export function getStoredICCredentials(): ICCredentials | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(IC_CREDS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeICCredentials(creds: ICCredentials) {
  localStorage.setItem(IC_CREDS_KEY, JSON.stringify(creds));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(IC_CREDS_KEY);
  document.cookie = "auth_active=; path=/; max-age=0";
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
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

export function extractUser(idToken: string, userInfo?: Record<string, unknown>): User | null {
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

export function defaultRedirect(u: User | null): string {
  if (!u || u.roles.length === 0) return "/projects";
  const top = u.roles[0];
  if (top === "admin" || top === "manager") return "/projects";
  if (top === "moderator") return "/interviews";
  return "/interviews";
}

export function isTokenExpired(token: string): boolean {
  const claims = parseJwtPayload(token);
  if (!claims?.exp) return true;
  return Date.now() >= (claims.exp as number) * 1000;
}

export function tokenExpiresIn(token: string): number {
  const claims = parseJwtPayload(token);
  if (!claims?.exp) return 0;
  return (claims.exp as number) * 1000 - Date.now();
}

/**
 * Extracts tokens from the nested backend response.
 * Handles both InCrowdAPI path and Cognito fallback path.
 */
export function extractTokensFromResponse(data: Record<string, unknown>): {
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
export const REFRESH_BUFFER_MS = 5 * 60 * 1000;
