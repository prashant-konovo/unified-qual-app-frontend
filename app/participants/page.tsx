"use client";

import { Loader2, Search, UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AddParticipantDialog } from "@/components/participants/add-participant-dialog";
import type { ParticipantRow } from "@/components/participants/participants-table";
import { ParticipantsTable } from "@/components/participants/participants-table";
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
import { participantsApi } from "@/lib/api/participants";
import { projectsApi } from "@/lib/api/projects";

interface ProjectOption {
  id: string;
  name: string;
}

export default function ParticipantsPage() {
  const [data, setData] = useState<ParticipantRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const fetchParticipants = useCallback(async () => {
    try {
      const result = await participantsApi.getParticipants();
      setData(result as ParticipantRow[]);
    } catch {
      toast.error("Failed to load participants");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    projectsApi
      .getProjectsList()
      .then((projs: { id?: string; _id?: string; name: string }[]) => {
        setProjects(
          projs.map((p) => ({ id: p.id ?? p._id ?? p.name, name: p.name }))
        );
      })
      .catch(() => {
        // Projects are supplemental — don't block the page
      });
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
    }

    if (projectFilter !== "all") {
      result = result.filter((p) => p.projectName === projectFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (p) =>
          p.surveyStatus === statusFilter || p.interviewStatus === statusFilter
      );
    }

    return result;
  }, [data, search, projectFilter, statusFilter]);

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
                  Participants
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
                Participants
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                View and manage survey respondents and their interview bookings
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Participant
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
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="disqualified">Disqualified</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ParticipantsTable data={filteredData} />
          )}
        </div>
      </main>

      <AddParticipantDialog
        onOpenChange={setDialogOpen}
        onSuccess={(created) => {
          setData((prev) => [created as ParticipantRow, ...prev]);
        }}
        open={dialogOpen}
      />
    </>
  );
}
