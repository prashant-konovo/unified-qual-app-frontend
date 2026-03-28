"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { projectsApi } from "@/lib/api/projects";
import { getColumns, type Project } from "./columns";
import { DataTable } from "./data-table";

// Generate 25 mock projects
const generateMockProjects = (): Project[] => {
  const statuses = ["Draft", "In Progress", "Completed", "Archived"] as const;
  const owners = [
    "Sarah Jenkins",
    "Alex Rivera",
    "Michael Chang",
    "Pramod Ukkali",
    "Jessica Lee",
    "David Kim",
  ];
  const names = [
    "Customer Onboarding Redesign",
    "Q1 Marketing Campaign",
    "Platform Security Audit",
    "Legacy API Deprecation",
    "User Research Survey",
    "Dashboard Analytics Update",
    "Mobile App Prototype",
    "Email Templates Revamp",
    "Checkout Flow Optimization",
    "Q2 Strategy Planning",
    "Internal Tools Dashboard",
    "Dark Mode Implementation",
    "Data Privacy Compliance",
    "Feedback Form Updates",
  ];
  const dates = [
    "Mar 12, 2026",
    "Mar 10, 2026",
    "Mar 5, 2026",
    "Feb 28, 2026",
    "Feb 15, 2026",
    "Jan 10, 2026",
  ];

  return Array.from({ length: 25 }).map((_, i) => {
    return {
      id: `proj-${i + 1}`,
      name: `${names[i % names.length]} ${Math.floor(i / names.length) > 0 ? `v${Math.floor(i / names.length) + 1}` : ""}`.trim(),
      status: statuses[i % statuses.length],
      owner: owners[i % owners.length],
      lastUpdated: dates[i % dates.length],
      updatedAgo: `${(i % 5) + 1}${i % 2 === 0 ? "d" : "w"}`,
    };
  });
};

const initialMockData = generateMockProjects();

export default function ProjectsPage() {
  const [data, setData] = useState<Project[]>(initialMockData);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("modified");

  // Fetch from API on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const apiData = await projectsApi.getProjectsList();
        if (Array.isArray(apiData)) {
          setData(apiData);
        } else {
          console.warn(
            "API returned non-array (likely a stub), falling back to mock data."
          );
        }
      } catch (error) {
        console.error("Using mock data. API fetch failed:", error);
      }
    }
    fetchProjects();
  }, []);

  // Action Handlers
  const handleDuplicate = async (project: Project) => {
    try {
      await projectsApi.createProject({
        name: `${project.name} (Copy)`,
        owner: project.owner,
        status: "Draft",
      });
    } catch (error) {
      console.error("Failed to create project via API:", error);
    }

    // Optimistic local update
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      name: `${project.name} (Copy)`,
      lastUpdated: "Just now",
      updatedAgo: "0m",
    };
    setData((prev) => [newProject, ...prev]);
  };

  const handleDelete = async (project: Project) => {
    try {
      await projectsApi.deleteProject(project.id);
    } catch (error) {
      console.error("Failed to delete project via API:", error);
    }

    // Optimistic local update
    setData((prev) => prev.filter((p) => p.id !== project.id));
  };

  // Derived filtered & sorted data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q)
      );
    }

    // Status
    if (status !== "all") {
      const normalizedStatus = status.toLowerCase().replace("-", " ");
      result = result.filter(
        (p) => p.status.toLowerCase() === normalizedStatus
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sort === "modified") {
        // Approximate mock sorting based on string dates
        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      }
      if (sort === "created") {
        // Fallback to numeric id parsing assumption
        const aVal = Number.parseInt(a.id.replace(/\D/g, "") || "0");
        const bVal = Number.parseInt(b.id.replace(/\D/g, "") || "0");
        return aVal - bVal;
      }
      return 0;
    });

    return result;
  }, [data, search, status, sort]);

  // Get columns initialized with our action callbacks
  const columns = useMemo(
    () =>
      getColumns({
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
      }),
    []
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
          {/* Page Header Area */}
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
              <Select onValueChange={setStatus} value={status}>
                <SelectTrigger className="w-full bg-background/50 transition-colors hover:bg-background sm:w-[180px]">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
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
            <DataTable columns={columns} data={filteredData} />
          </div>
        </div>
      </main>
    </>
  );
}
