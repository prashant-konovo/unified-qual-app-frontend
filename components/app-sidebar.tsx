"use client";

import {
  CalendarIcon,
  ClipboardListIcon,
  CreditCardIcon,
  FolderIcon,
  Hourglass,
  MicVocalIcon,
  UserRound,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import type * as React from "react";
import { useMemo } from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";

// Navigation items with role-based visibility matching legacy QS-Tool + InCrowdAPI.
// allowedRoles: which unified roles can see this item.
// If empty, any authenticated user can see it.
const navItems = [
  {
    title: "Projects",
    url: "/projects",
    icon: <FolderIcon />,
    isActive: true,
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Interviews",
    url: "/interviews",
    icon: <UsersIcon />,
    allowedRoles: [], // any authenticated user
  },
  {
    title: "My schedule",
    url: "/my-schedule",
    icon: <CalendarIcon />,
    allowedRoles: [], // any authenticated user (moderators use this)
  },
  {
    title: "Surveys",
    url: "/surveys",
    icon: <ClipboardListIcon />,
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Subscriptions",
    url: "/subscriptions",
    icon: <CreditCardIcon />,
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Crowds",
    url: "/crowds",
    icon: <UsersIcon />,
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Moderators",
    url: "/moderators",
    icon: <MicVocalIcon />,
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Participants",
    url: "/participants",
    icon: <UserRound />,
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Waiting Queue",
    url: "/waiting-queue",
    icon: <Hourglass />,
    allowedRoles: ["admin", "manager"],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, hasRole } = useAuth();
  const displayUser = {
    name: user?.username ?? user?.email?.split("@")[0] ?? "User",
    email: user?.email ?? "",
    avatar: "/avatars/shadcn.jpg",
  };

  // Filter nav items based on user's unified roles
  const visibleItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      return hasRole(...(item.allowedRoles as Parameters<typeof hasRole>));
    });
  }, [hasRole]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    alt="Konovo logo"
                    className="size-8 object-contain"
                    height={100}
                    src="/logo.png"
                    width={100}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Konovo</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
