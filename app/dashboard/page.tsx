"use client";

import {
  CalendarDays,
  ClipboardList,
  Loader2,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { bookingsApi, type EnrichedBooking } from "@/lib/api/bookings";
import { moderatorsApi } from "@/lib/api/moderators";
import {
  projectsApi,
  type ProjectListItem,
} from "@/lib/api/projects";

// ── Status labels for display ─────────────────────────────────────────────
const STATUS_LABELS: Record<number, string> = {
  1: "Inquiry",
  2: "Defining",
  3: "In Progress",
  4: "Complete",
  6: "Paused",
  7: "Finalizing",
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [moderatorCount, setModeratorCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, b, m] = await Promise.all([
          projectsApi.getProjectsList().catch(() => []),
          bookingsApi.getAllBookings().catch(() => []),
          moderatorsApi.getModeratorsList().catch(() => []),
        ]);
        setProjects(Array.isArray(p) ? p : []);
        setBookings(Array.isArray(b) ? b : []);
        setModeratorCount(Array.isArray(m) ? m.length : 0);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Derived metrics ──────────────────────────────────────────────
  const totalProjects = projects.length;
  const upcomingBookings = bookings.filter(
    (b) => b.status === "scheduled"
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  ).length;

  // Project counts by status
  const statusCounts: Record<number, number> = {};
  for (const p of projects) {
    const sid = Number(p.statusId) || 0;
    statusCounts[sid] = (statusCounts[sid] || 0) + 1;
  }

  // Scheduling progress — per-project
  const progressRows = projects
    .filter((p) => [3, 7].includes(Number(p.statusId) || 0)) // In Progress or Finalizing
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      name: p.name,
      scheduled: p.scheduledCount ?? 0,
      completed: p.completedCount ?? 0,
      brand: p.serviceCategory === "LS" ? "LS" : "MRA",
    }));

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* ── KPI Cards ────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Projects"
              value={totalProjects}
              icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
              sub={`${statusCounts[3] ?? 0} in progress`}
            />
            <KpiCard
              title="Upcoming Interviews"
              value={upcomingBookings}
              icon={<Video className="h-4 w-4 text-muted-foreground" />}
              sub={`${completedBookings} completed`}
            />
            <KpiCard
              title="Moderators"
              value={moderatorCount}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              sub="Active"
            />
            <KpiCard
              title="Total Bookings"
              value={bookings.length}
              icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
              sub={`${bookings.filter((b) => b.status === "cancelled").length} cancelled`}
            />
          </div>

          {/* ── Two-column: Status Breakdown + Scheduling Progress ── */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Projects by Status
                </CardTitle>
                <CardDescription>
                  Distribution of all {totalProjects} projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statusCounts)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([sid, cnt]) => {
                      const pct =
                        totalProjects > 0
                          ? Math.round((cnt / totalProjects) * 100)
                          : 0;
                      return (
                        <div key={sid}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span>
                              {STATUS_LABELS[Number(sid)] ?? `Status ${sid}`}
                            </span>
                            <span className="text-muted-foreground">
                              {cnt} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  {totalProjects === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No projects yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Scheduling Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Scheduling Progress
                </CardTitle>
                <CardDescription>
                  Active projects — scheduled vs completed interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                {progressRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No active projects with scheduling data.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {progressRows.map((row) => {
                      const total = row.scheduled + row.completed;
                      const pct =
                        total > 0
                          ? Math.round((row.completed / total) * 100)
                          : 0;
                      return (
                        <div key={row.id}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="truncate max-w-[220px]">
                              {row.name}
                            </span>
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                  row.brand === "LS"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {row.brand}
                              </span>
                              {row.completed}/{total}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Recent Bookings Table ────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Bookings</CardTitle>
              <CardDescription>
                Latest {Math.min(bookings.length, 8)} bookings across all
                projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No bookings found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium">Project</th>
                        <th className="pb-2 font-medium">Participant</th>
                        <th className="pb-2 font-medium">Moderator</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Brand</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 8).map((b) => (
                        <tr key={b.id} className="border-b last:border-0">
                          <td className="py-2">{b.projectName ?? "—"}</td>
                          <td className="py-2">{b.participantName ?? "—"}</td>
                          <td className="py-2">{b.moderatorName ?? "—"}</td>
                          <td className="py-2">
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                                b.status === "scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : b.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                b.serviceCategory === "LS"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {b.serviceCategory === "LS" ? "LS" : "MRA"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ── KPI Card sub-component ────────────────────────────────────────────────
function KpiCard({
  title,
  value,
  icon,
  sub,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  sub: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
