import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setMockUser,
  resetMockAuth,
  mockAdminUser,
} from "@/lib/__mocks__/auth-context";

vi.mock("@/lib/auth-context", () => import("@/lib/__mocks__/auth-context"));
vi.mock("@/lib/axios", () => import("@/lib/__mocks__/axios"));

// We need to import after mocks are set up
const { default: LoginPage } = await import("@/app/login/page");

describe("LoginPage", () => {
  beforeEach(() => {
    resetMockAuth();
    setMockUser(null); // Login page should work without an authenticated user
  });

  it("renders email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders Sign in button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("renders SSO button", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: "Sign in with SSO" }),
    ).toBeInTheDocument();
  });

  it("renders page title and description", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.getByText("Enter your credentials to access Unified Qual"),
    ).toBeInTheDocument();
  });

  it("has email input with correct type", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("has password input with correct type", () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
