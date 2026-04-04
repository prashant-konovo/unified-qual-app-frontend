import { vi } from "vitest";
import type { AuthContextValue, UnifiedRole, User } from "../auth-types";

// Default mock user (admin)
export const mockAdminUser: User = {
  id: 1,
  sub: "test-sub-admin",
  email: "admin@test.com",
  username: "testadmin",
  firstName: "Test",
  lastName: "Admin",
  groups: ["ADMIN"],
  roles: ["admin"],
};

export const mockManagerUser: User = {
  id: 2,
  sub: "test-sub-manager",
  email: "manager@test.com",
  username: "testmanager",
  firstName: "Test",
  lastName: "Manager",
  groups: ["QUAL_SCHEDULER_MANAGER"],
  roles: ["manager"],
};

export const mockModeratorUser: User = {
  id: 3,
  sub: "test-sub-moderator",
  email: "moderator@test.com",
  username: "testmoderator",
  firstName: "Test",
  lastName: "Moderator",
  groups: ["QUAL_SCHEDULER_MODERATOR"],
  roles: ["moderator"],
};

// Configurable mock state
let _mockUser: User | null = mockAdminUser;
let _mockIsLoading = false;

export function setMockUser(user: User | null) {
  _mockUser = user;
}

export function setMockIsLoading(loading: boolean) {
  _mockIsLoading = loading;
}

export function resetMockAuth() {
  _mockUser = mockAdminUser;
  _mockIsLoading = false;
}

// Mock hook
export const useAuth = vi.fn((): AuthContextValue => ({
  user: _mockUser,
  isLoading: _mockIsLoading,
  login: vi.fn(),
  loginWithCode: vi.fn(),
  logout: vi.fn(),
  getToken: vi.fn(() => "mock-token"),
  hasRole: (...roles: UnifiedRole[]) => {
    if (!_mockUser) return false;
    return roles.some((r) => _mockUser!.roles.includes(r));
  },
  isAdmin: _mockUser?.roles.includes("admin") ?? false,
  isManager: _mockUser?.roles.includes("manager") ?? false,
  isModerator: _mockUser?.roles.includes("moderator") ?? false,
}));

// Mock provider (pass-through)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
