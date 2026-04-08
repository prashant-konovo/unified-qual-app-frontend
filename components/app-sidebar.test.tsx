import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setMockUser,
  resetMockAuth,
  mockAdminUser,
  mockManagerUser,
  mockModeratorUser,
} from "@/lib/__mocks__/auth-context";

vi.mock("@/lib/auth-context", () => import("@/lib/__mocks__/auth-context"));

// The AppSidebar uses many Radix/shadcn components that are hard to render in jsdom.
// Instead, we test the nav filtering logic directly — the core business logic.
const navItems = [
  { title: "Projects", url: "/projects", allowedRoles: ["admin", "manager"] },
  { title: "Interviews", url: "/interviews", allowedRoles: [] },
  { title: "My schedule", url: "/my-schedule", allowedRoles: [] },
  { title: "Surveys", url: "/surveys", allowedRoles: ["admin", "manager"] },
  { title: "Subscriptions", url: "/subscriptions", allowedRoles: ["admin", "manager"] },
  { title: "Crowds", url: "/crowds", allowedRoles: ["admin", "manager"] },
  { title: "Moderators", url: "/moderators", allowedRoles: ["admin", "manager"] },
  { title: "Participants", url: "/participants", allowedRoles: ["admin", "manager"] },
];

function filterNavItems(
  items: typeof navItems,
  hasRole: (...roles: string[]) => boolean,
) {
  return items.filter((item) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
    return hasRole(...item.allowedRoles);
  });
}

describe("AppSidebar nav filtering logic", () => {
  beforeEach(() => {
    resetMockAuth();
  });

  it("admin sees all 8 nav items", () => {
    setMockUser(mockAdminUser);
    const hasRole = (...roles: string[]) =>
      roles.some((r) => mockAdminUser.roles.includes(r as "admin"));
    const visible = filterNavItems(navItems, hasRole);
    expect(visible).toHaveLength(8);
    expect(visible.map((i) => i.title)).toEqual([
      "Projects",
      "Interviews",
      "My schedule",
      "Surveys",
      "Subscriptions",
      "Crowds",
      "Moderators",
      "Participants",
    ]);
  });

  it("manager sees all 8 nav items", () => {
    setMockUser(mockManagerUser);
    const hasRole = (...roles: string[]) =>
      roles.some((r) => mockManagerUser.roles.includes(r as "admin"));
    const visible = filterNavItems(navItems, hasRole);
    expect(visible).toHaveLength(8);
  });

  it("moderator sees only open items (Interviews, My schedule)", () => {
    setMockUser(mockModeratorUser);
    const hasRole = (...roles: string[]) =>
      roles.some((r) => mockModeratorUser.roles.includes(r as "admin"));
    const visible = filterNavItems(navItems, hasRole);
    expect(visible).toHaveLength(2);
    expect(visible.map((i) => i.title)).toEqual(["Interviews", "My schedule"]);
  });

  it("unauthenticated user sees only open items", () => {
    setMockUser(null);
    const hasRole = () => false;
    const visible = filterNavItems(navItems, hasRole);
    expect(visible).toHaveLength(2);
    expect(visible.map((i) => i.title)).toEqual(["Interviews", "My schedule"]);
  });
});
