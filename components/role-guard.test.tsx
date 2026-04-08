import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { RoleGuard } from "./role-guard";
import {
  setMockUser,
  setMockIsLoading,
  resetMockAuth,
  mockAdminUser,
  mockModeratorUser,
} from "@/lib/__mocks__/auth-context";

vi.mock("@/lib/auth-context", () => import("@/lib/__mocks__/auth-context"));

describe("RoleGuard", () => {
  beforeEach(() => {
    resetMockAuth();
  });

  it("renders children when user has allowed role", () => {
    setMockUser(mockAdminUser);
    render(
      <RoleGuard allowedRoles={["admin"]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders children when user has one of multiple allowed roles", () => {
    setMockUser(mockAdminUser);
    render(
      <RoleGuard allowedRoles={["admin", "manager"]}>
        <div>Admin or Manager</div>
      </RoleGuard>,
    );
    expect(screen.getByText("Admin or Manager")).toBeInTheDocument();
  });

  it("shows Access Denied when user lacks required role", () => {
    setMockUser(mockModeratorUser);
    render(
      <RoleGuard allowedRoles={["admin"]}>
        <div>Admin Only</div>
      </RoleGuard>,
    );
    expect(screen.queryByText("Admin Only")).not.toBeInTheDocument();
    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });

  it("renders custom fallback when user lacks role", () => {
    setMockUser(mockModeratorUser);
    render(
      <RoleGuard allowedRoles={["admin"]} fallback={<div>Custom Denied</div>}>
        <div>Admin Only</div>
      </RoleGuard>,
    );
    expect(screen.queryByText("Admin Only")).not.toBeInTheDocument();
    expect(screen.getByText("Custom Denied")).toBeInTheDocument();
  });

  it("renders nothing while loading", () => {
    setMockIsLoading(true);
    const { container } = render(
      <RoleGuard allowedRoles={["admin"]}>
        <div>Content</div>
      </RoleGuard>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when no user", () => {
    setMockUser(null);
    const { container } = render(
      <RoleGuard allowedRoles={["admin"]}>
        <div>Content</div>
      </RoleGuard>,
    );
    expect(container.innerHTML).toBe("");
  });
});
