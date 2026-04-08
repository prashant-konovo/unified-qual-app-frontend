"use client";

import { Info, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { projectsApi, type ProjectListItem } from "@/lib/api/projects";
import { participantsApi } from "@/lib/api/participants";

interface CrowdRow {
  id: string;
  name: string;
  status: string;
  serviceCategory: string;
  subscriptionCompany: string;
  sampleSize: number;
  memberCount: number;
}

export default function CrowdsPage() {
  const [crowds, setCrowds] = useState<CrowdRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scFilter, setScFilter] = useState("all");

  const loadCrowds = useCallback(async () => {
    try {
      const [projects, participants] = await Promise.all([
        projectsApi.getProjectsList(),
        participantsApi.getParticipants(),
      ]);

      // Count participants per project
      const countByProject: Record<string, number> = {};
      for (const p of participants as any[]) {
        const pName = p.projectName ?? p.project ?? "";
        if (pName) countByProject[pName] = (countByProject[pName] ?? 0) + 1;
      }

      const rows: CrowdRow[] = projects.map((p: ProjectListItem) => ({
        id: String(p.id),
        name: p.name,
        status: p.status,
        serviceCategory: p.serviceCategory ?? (p.source === "iris" ? "LS" : "MRA"),
        subscriptionCompany: p.subscriptionCompany ?? "—",
        sampleSize: p.sampleSize ?? 0,
        memberCount: countByProject[p.name] ?? 0,
      }));

      setCrowds(rows);
    } catch {
      toast.error("Failed to load crowds");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCrowds();
  }, [loadCrowds]);

  const filtered = useMemo(() => {
    let result = crowds;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.subscriptionCompany.toLowerCase().includes(q)
      );
    }
    if (scFilter !== "all") {
      result = result.filter((c) => c.serviceCategory === scFilter);
    }
    return result;
  }, [crowds, search, scFilter]);

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-background/95">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator className="mr-2 h-4" orientation="vertical" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Unified Qual</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Crowds</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col space-y-6 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">Crowds</h1>
            <p className="mt-1 text-muted-foreground">
              Participant groups derived from projects.
            </p>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>Crowd Data</AlertTitle>
          <AlertDescription>
            Each project&apos;s participant pool is shown as a crowd. Member
            counts reflect linked respondents.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center dark:border-zinc-800/60">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project or subscription..."
              value={search}
            />
          </div>
          <Select onValueChange={setScFilter} value={scFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              <SelectItem value="LS">LS (Life Sciences)</SelectItem>
              <SelectItem value="MRA">MRA (Market Research)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-md border bg-card">
            <div className="w-full overflow-x-auto">
              <Table className="w-full min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Project / Crowd</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead className="text-right">Sample Size</TableHead>
                    <TableHead className="text-right">Members</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length > 0 ? (
                    filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              c.serviceCategory === "LS"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {c.serviceCategory}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{c.status}</TableCell>
                        <TableCell className="text-sm">
                          {c.subscriptionCompany}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {c.sampleSize || "—"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {c.memberCount}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={6}>
                        No crowds found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
