"use client";

import { Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  projectsApi,
  type ProjectListItem,
  type ServiceCategory,
} from "@/lib/api/projects";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";

type TabValue = "all" | "LS" | "MRA";

export default function ProjectsPage() {
  const [data, setData] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("modified");
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeTab !== "all") {
        params.serviceCategory = activeTab;
      }
      const apiData = await projectsApi.getProjectsList(params);
      setData(apiData);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDuplicate = useCallback(
    async (project: ProjectListItem) => {
      try {
        await projectsApi.createProject({
          name: `${project.name} (Copy)`,
          source: project.source,
        });
        fetchProjects();
      } catch (error) {
        console.error("Failed to duplicate project:", error);
      }
    },
    [fetchProjects]
  );

  const handleDelete = useCallback(
    async (project: ProjectListItem) => {
      try {
        await projectsApi.deleteProject(project.id);
        setData((prev) => prev.filter((p) => p.id !== project.id));
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    },
    []
  );

  // Derived filtered & sorted data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.subscriptionCompany ?? "").toLowerCase().includes(q) ||
          (p.clientCompany ?? "").toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const normalized = statusFilter.toLowerCase();
      result = result.filter(
        (p) => (p.status ?? "").toLowerCase() === normalized
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "modified") {
        const aDate = a.modifiedAt ?? a.createdAt ?? "";
        const bDate = b.modifiedAt ?? b.createdAt ?? "";
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      }
      if (sort === "created") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return 0;
    });

    return result;
  }, [data, search, statusFilter, sort]);

  const columns = useMemo(
    () =>
      getColumns({
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
      }),
    [handleDelete, handleDuplicate]
  );

  // Counts per tab
  const allCount = data.length;
  const lsCounts = useMemo(
    () => data.filter((p) => p.serviceCategory === "LS").length,
    [data]
  );
  const mraCounts = useMemo(
    () => data.filter((p) => p.serviceCategory === "MRA").length,
    [data]
  );

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
                  Projects
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
                Projects
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                Manage and organize your research projects
              </p>
            </div>
            <Button
              asChild
              className="rounded-full shadow-sm transition-all hover:shadow-md"
              size="lg"
            >
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>

          {/* Service Category Tabs (LS / MRA) */}
          <div className="flex gap-1 rounded-lg border border-zinc-200/60 bg-card p-1 shadow-sm dark:border-zinc-800/60">
            {(
              [
                { value: "all" as TabValue, label: "All Projects" },
                { value: "LS" as TabValue, label: "LS (Life Sciences)" },
                { value: "MRA" as TabValue, label: "MRA (Market Research & Analysis)" },
              ] as const
            ).map((tab) => {
              const count =
                tab.value === "all"
                  ? allCount
                  : tab.value === "LS"
                    ? lsCounts
                    : mraCounts;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  {tab.label}
                  {!isLoading && (
                    <span
                      className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted-foreground/10 text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filters Section */}
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-200/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center dark:border-zinc-800/60">
            <div className="flex flex-1 flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-[280px]">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="w-full bg-background/50 pl-9 transition-colors focus-visible:bg-background"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects..."
                  type="search"
                  value={search}
                />
              </div>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-full bg-background/50 transition-colors hover:bg-background sm:w-[180px]">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="defining">Defining</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="inquiry">Inquiry</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2 flex w-full items-center gap-3 sm:mt-0 sm:w-auto">
              <span className="hidden whitespace-nowrap font-medium text-muted-foreground text-sm sm:inline-block">
                Sort by:
              </span>
              <Select onValueChange={setSort} value={sort}>
                <SelectTrigger className="w-full bg-background/50 transition-colors hover:bg-background sm:w-[160px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modified">Modified Date</SelectItem>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          <div className="fade-in slide-in-from-bottom-4 animate-in duration-500 will-change-transform">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DataTable columns={columns} data={filteredData} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
