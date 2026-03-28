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

const data = {
  user: {
    name: "Pramod",
    email: "pramod@konovo.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Projects",
      url: "/projects",
      icon: <FolderIcon />,
      isActive: true,
    },
    {
      title: "Interviews",
      url: "/interviews",
      icon: <UsersIcon />,
    },
    {
      title: "My schedule",
      url: "/my-schedule",
      icon: <CalendarIcon />,
    },
    {
      title: "Surveys",
      url: "/surveys",
      icon: <ClipboardListIcon />,
    },
    {
      title: "Subscriptions",
      url: "/subscriptions",
      icon: <CreditCardIcon />,
    },
    {
      title: "Crowds",
      url: "/crowds",
      icon: <UsersIcon />,
    },
    {
      title: "Moderators",
      url: "/moderators",
      icon: <MicVocalIcon />,
    },
    {
      title: "Participants",
      url: "/participants",
      icon: <UserRound />,
    },
    {
      title: "Waiting Queue",
      url: "/waiting-queue",
      icon: <Hourglass />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  {/* <span className="truncate text-xs">Qual Scheduler</span> */}
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
