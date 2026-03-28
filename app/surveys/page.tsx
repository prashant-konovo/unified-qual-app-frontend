"use client";

import { Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Survey } from "@/app/survey-builder/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { surveysApi } from "@/lib/api/surveys";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";

export default function SurveysPage() {
  const [data, setData] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // Attach dialog state
  const [attachingSurvey, setAttachingSurvey] = useState<Survey | null>(null);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLinking, setIsLinking] = useState(false);

  // Fetch from API on mount
  useEffect(() => {
    async function fetchSurveys() {
      try {
        const apiData = await surveysApi.getSurveysList();
        if (Array.isArray(apiData)) {
          setData(apiData);
        }
      } catch (error) {
        console.error("API fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSurveys();
  }, []);

  // Action Handlers
  const handleDelete = async (survey: Survey) => {
    try {
      await surveysApi.deleteSurvey(survey.id);
    } catch (error) {
      console.error("Failed to delete survey via API:", error);
    }
    // Optimistic local update
    setData((prev) => prev.filter((s) => s.id !== survey.id));
  };

  const handleAttach = async (survey: Survey) => {
    setAttachingSurvey(survey);
    setSelectedProjectId(survey.projectId || "");
    try {
      const projects = await projectsApi.getProjectsList();
      if (Array.isArray(projects)) {
        setProjectsList(projects);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const confirmAttach = async () => {
    if (!(attachingSurvey && selectedProjectId)) {
      return;
    }
    setIsLinking(true);
    try {
      const proj = projectsList.find((p) => p.id === selectedProjectId);
      await surveysApi.updateSurvey(attachingSurvey.id, {
        ...attachingSurvey,
        projectId: selectedProjectId,
        projectName: proj?.name || "Unknown Project",
      });
      // Optimistically update the local row
      setData((prev) =>
        prev.map((s) =>
          s.id === attachingSurvey.id
            ? {
                ...s,
                projectId: selectedProjectId,
                projectName: proj?.name || "Unknown Project",
              }
            : s
        )
      );
      setAttachingSurvey(null);
    } catch (e) {
      console.error("Failed to link survey", e);
    } finally {
      setIsLinking(false);
    }
  };

  // Derived filtered & sorted data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          (s.projectName || "").toLowerCase().includes(q) ||
          (s.crowdName || "").toLowerCase().includes(q)
      );
    }

    // Status
    if (status !== "all") {
      result = result.filter(
        (s) => (s.status || "draft").toLowerCase() === status.toLowerCase()
      );
    }

    return result;
  }, [data, search, status]);

  // Get columns initialized with our action callbacks
  const columns = useMemo(
    () =>
      getColumns({
        onDelete: handleDelete,
        onAttach: handleAttach,
      }),
    [handleAttach, handleDelete]
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
                  Surveys
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
                Surveys
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                Manage your screening surveys
              </p>
            </div>
            <Button
              asChild
              className="rounded-full shadow-sm transition-all hover:shadow-md"
              size="lg"
            >
              <Link href="/survey-builder">
                <Plus className="mr-2 h-4 w-4" />
                New Survey
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
                  placeholder="Search surveys..."
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
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="fade-in slide-in-from-bottom-4 animate-in duration-500 will-change-transform">
              <DataTable columns={columns} data={filteredData} />
            </div>
          )}

          {/* Attach Dialog */}
          <Dialog
            onOpenChange={(open) => !open && setAttachingSurvey(null)}
            open={!!attachingSurvey}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Attach Survey to Project</DialogTitle>
                <DialogDescription>
                  Select a project to link{" "}
                  <span className="font-semibold text-foreground">
                    {attachingSurvey?.projectName || "Untitled"}
                  </span>{" "}
                  to.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Select
                    onValueChange={setSelectedProjectId}
                    value={selectedProjectId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projectsList.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={isLinking}
                  onClick={() => setAttachingSurvey(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!selectedProjectId || isLinking}
                  onClick={confirmAttach}
                >
                  {isLinking && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  );
}
