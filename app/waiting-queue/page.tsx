"use client";

import { Loader2, Search, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { projectsApi } from "@/lib/api/projects";
import type { WaitingQueueEntry } from "@/lib/api/waiting-queue";
import { waitingQueueApi } from "@/lib/api/waiting-queue";

interface ProjectOption {
  id: string;
  name: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) {
    return "—";
  }
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }
  return d.toLocaleDateString();
}

function queueBadgeClass(status: string) {
  if (status === "waiting") {
    return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400";
  }
  if (status === "matched") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";
  }
  return "border-zinc-300 bg-zinc-100 text-zinc-600";
}

export default function WaitingQueuePage() {
  const [data, setData] = useState<WaitingQueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  const fetchQueue = useCallback(async () => {
    try {
      const result = await waitingQueueApi.getQueue();
      setData(result);
    } catch {
      toast.error("Failed to load waiting queue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    projectsApi
      .getProjectsList()
      .then((projs) => {
        setProjects(
          projs.map((p) => ({ id: String(p.id), name: p.name }))
        );
      })
      .catch(() => {
        // Supplemental — don't block page
      });
  }, []);

  const handleTriggerMatching = async () => {
    setIsMatching(true);
    try {
      const result = await waitingQueueApi.triggerMatching(
        projectFilter === "all" ? undefined : projectFilter
      );
      toast.success(
        `Matching complete — ${result.assigned} auto-assigned, ${result.invited} invited`
      );
      fetchQueue();
    } catch {
      toast.error("Failed to trigger slot matching");
    } finally {
      setIsMatching(false);
    }
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    if (projectFilter !== "all") {
      result = result.filter((e) => e.projectId === projectFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          (e.participantName ?? "").toLowerCase().includes(q) ||
          (e.participantEmail ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, projectFilter, search]);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-lg">
                  Waiting Queue
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-zinc-50/50 p-4 md:p-8 dark:bg-zinc-950/20">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-bold text-3xl text-foreground tracking-tight">
                Waiting Queue
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                Participants waiting for a matching interview slot
              </p>
            </div>
            <Button disabled={isMatching} onClick={handleTriggerMatching}>
              {isMatching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Trigger Matching
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 rounded-xl border border-zinc-200/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center dark:border-zinc-800/60">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                value={search}
              />
            </div>
            <Select onValueChange={setProjectFilter} value={projectFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Preferred Time</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Timezone</TableHead>
                    <TableHead>Waiting Since</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length ? (
                    filteredData.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {entry.participantName ?? entry.userId}
                            </span>
                            {entry.participantEmail && (
                              <span className="text-muted-foreground text-xs">
                                {entry.participantEmail}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.projectName ?? entry.projectId}
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.preferredStart} – {entry.preferredEnd}
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.preferredDays.join(", ")}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {entry.timezone}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(entry.waitingSince)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={queueBadgeClass(entry.status)}
                            variant="outline"
                          >
                            {entry.status.charAt(0).toUpperCase() +
                              entry.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        className="py-12 text-center text-muted-foreground"
                        colSpan={7}
                      >
                        No participants in the waiting queue.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && (
            <p className="text-muted-foreground text-sm">
              {filteredData.length} participant
              {filteredData.length !== 1 ? "s" : ""} waiting
            </p>
          )}
        </div>
      </main>
    </>
  );
}
