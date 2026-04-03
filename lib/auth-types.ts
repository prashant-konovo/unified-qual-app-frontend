export type UnifiedRole = "admin" | "manager" | "moderator" | "observer" | "external";

export interface User {
  id: number | null;
  sub: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  groups: string[];
  roles: UnifiedRole[];
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

export interface ICCredentials {
  icUserId: number;
  icAuthToken: string;
  apiKey: string;
}

export interface AuthContextValue {
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
