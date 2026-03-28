"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bookingsApi, type EnrichedBooking } from "@/lib/api/bookings";

import { createColumns } from "./columns";
import type { Interview, RewardStatus } from "./data";
import { DataTable } from "./data-table";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseISOLocal(iso: string): Date {
  const [datePart, timePart] = iso.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, m] = (timePart ?? "00:00").split(":").map(Number);
  return new Date(y, mo - 1, d, h, m);
}

function formatTime12(dt: Date): string {
  const h = dt.getHours();
  const m = dt.getMinutes();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? "AM" : "PM";
  const mStr = m === 0 ? "" : `:${String(m).padStart(2, "0")}`;
  return `${h12}${mStr} ${ampm}`;
}

const STATUS_TAB_MAP: Record<string, string> = {
  upcoming: "scheduled",
  completed: "completed",
  invalidated: "cancelled",
};

const BOOKING_TO_INTERVIEW_STATUS: Record<string, Interview["status"]> = {
  scheduled: "Upcoming",
  completed: "Completed",
  cancelled: "Invalidated",
  no_show: "Invalidated",
};

function bookingToInterview(b: EnrichedBooking): Interview {
  const start = parseISOLocal(b.slotStart);
  const end = parseISOLocal(b.slotEnd);
  const date = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const timeRange = `${formatTime12(start)} – ${formatTime12(end)}`;
  const durationMins = Math.round((end.getTime() - start.getTime()) / 60_000);
  const duration =
    durationMins >= 60
      ? `${Math.floor(durationMins / 60)}h${durationMins % 60 ? ` ${durationMins % 60}min` : ""}`
      : `${durationMins} min`;

  return {
    id: b.id,
    title: `Interview #${b.id.slice(-6).toUpperCase()}`,
    topic: b.projectName || "—",
    date,
    timeRange,
    duration,
    moderator: b.moderatorName || "—",
    participantId: b.userId.slice(-6).toUpperCase(),
    participantName: b.participantName || "Unknown",
    rewardPoints: b.rewardPoints,
    rewardStatus: (b.rewardStatus === "credited"
      ? "Credited"
      : "Not Credited") as RewardStatus,
    status: BOOKING_TO_INTERVIEW_STATUS[b.status] ?? "Upcoming",
    account: b.projectName || "—",
    client: b.projectName || "—",
    project: b.projectName || "—",
    meetingLink: b.meetingLink,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInterviews = useCallback((tab: string) => {
    setIsLoading(true);
    bookingsApi
      .getAllBookings(STATUS_TAB_MAP[tab])
      .then((data) => setInterviews(data.map(bookingToInterview)))
      .catch(() => toast.error("Failed to load interviews"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadInterviews(activeTab);
  }, [activeTab, loadInterviews]);

  const handleCreditRewards = useCallback(
    async (interview: Interview) => {
      try {
        await bookingsApi.updateReward(interview.id, {
          rewardStatus: "credited",
          rewardPoints: interview.rewardPoints,
        });
        toast.success("Rewards credited");
        loadInterviews(activeTab);
      } catch {
        toast.error("Failed to credit rewards");
      }
    },
    [activeTab, loadInterviews]
  );

  const handleInvalidate = useCallback(
    async (id: string) => {
      try {
        await bookingsApi.updateBooking(id, { status: "cancelled" });
        toast.success("Interview invalidated");
        loadInterviews(activeTab);
      } catch {
        toast.error("Failed to invalidate interview");
      }
    },
    [activeTab, loadInterviews]
  );

  const columns = useMemo(
    () =>
      createColumns({
        onCreditRewards: handleCreditRewards,
        onInvalidate: handleInvalidate,
      }),
    [handleCreditRewards, handleInvalidate]
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
          <div className="flex w-full items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Interviews</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between pb-6">
            <div>
              <h1 className="font-bold text-3xl tracking-tight">Interviews</h1>
              <p className="mt-2 text-muted-foreground">
                Manage and review all scheduled and completed interviews.
              </p>
            </div>
          </div>

          {/* Tabs & Table Section */}
          <Tabs
            className="w-full"
            defaultValue="upcoming"
            onValueChange={setActiveTab}
          >
            <TabsList className="flex grid h-12 w-full max-w-md grid-cols-3 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
              <TabsTrigger
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                value="upcoming"
              >
                Upcoming Interviews
              </TabsTrigger>
              <TabsTrigger
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                value="completed"
              >
                Completed Interviews
              </TabsTrigger>
              <TabsTrigger
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                value="invalidated"
              >
                Invalidated
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 rounded-lg border bg-card px-6 py-4 text-card-foreground shadow-sm">
              {(["upcoming", "completed", "invalidated"] as const).map(
                (tab) => (
                  <TabsContent
                    className="m-0 border-none p-0 outline-none"
                    key={tab}
                    value={tab}
                  >
                    {isLoading ? (
                      <div className="py-12 text-center text-muted-foreground text-sm">
                        Loading…
                      </div>
                    ) : (
                      <DataTable columns={columns} data={interviews} />
                    )}
                  </TabsContent>
                )
              )}
            </div>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
