"use client";

import {
  Calendar,
  Clock,
  Hash,
  LayoutDashboard,
  Loader2,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
// biome-ignore lint/performance/noNamespaceImport: <explanation>
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  projectsApi,
  type ProjectDetail,
  type ProjectSource,
} from "@/lib/api/projects";

function ProjectDetailsInner() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const source = searchParams.get("source") as ProjectSource | null;

  const [project, setProject] = React.useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProject() {
      if (!id) return;
      try {
        const data = await projectsApi.getProject(
          id as string,
          source ?? undefined
        );
        setProject(data);
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProject();
  }, [id, source]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-zinc-50/50 dark:bg-zinc-950/20">
        <h2 className="font-semibold text-xl">Project not found</h2>
        <p className="text-muted-foreground">
          The project you are looking for does not exist or was deleted.
        </p>
        <Button asChild>
          <Link href="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const isLS = project.serviceCategory === "LS";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator className="mr-2 h-4" orientation="vertical" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/projects">Projects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold">
                {project.name || "Project Details"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 bg-zinc-50/50 p-4 md:p-8 dark:bg-zinc-950/20">
        <div className="fade-in mx-auto max-w-5xl animate-in space-y-6 duration-500 will-change-transform">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <h1 className="font-bold text-3xl tracking-tight">
                {project.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                <Badge variant={isLS ? "default" : "secondary"}>
                  {project.serviceCategory}
                </Badge>
                {project.status && (
                  <Badge variant="outline">{project.status}</Badge>
                )}
                <span>•</span>
                <span>ID: {project.id}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/projects">Back to Projects</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Interview Length */}
                {project.interviewLength != null && (
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
                      <Clock className="h-3.5 w-3.5" /> Interview Length
                    </span>
                    <p className="font-medium">{project.interviewLength} mins</p>
                  </div>
                )}

                {/* Sample Size (LS) */}
                {project.sampleSize != null && (
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
                      <Users className="h-3.5 w-3.5" /> Sample Size
                    </span>
                    <p className="font-medium">{project.sampleSize}</p>
                  </div>
                )}

                {/* Description (MRA) */}
                {project.description && (
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground text-sm">
                      Description
                    </span>
                    <p className="text-sm">{project.description}</p>
                  </div>
                )}

                <Separator />

                {/* Topics (LS) */}
                {project.topics && project.topics.length > 0 && (
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
                      <Tag className="h-3.5 w-3.5" /> Topics
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.topics.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Salesforce (both) */}
                {(project.salesforceJobNumber ||
                  project.salesforceProjectId) && (
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
                      <Hash className="h-3.5 w-3.5" /> Salesforce Reference
                    </span>
                    <p className="font-medium">
                      {project.salesforceJobNumber ??
                        project.salesforceProjectId}
                    </p>
                  </div>
                )}

                {/* Company */}
                {(project.subscriptionCompany || project.clientCompany) && (
                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground text-sm">
                      Company
                    </span>
                    <p className="font-medium">
                      {project.subscriptionCompany ?? project.clientCompany}
                    </p>
                  </div>
                )}

                {/* Created */}
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
                    <Calendar className="h-3.5 w-3.5" /> Created
                  </span>
                  <p className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling Stats Card (both LS and MRA — QS has scheduling data) */}
            {(project.scheduledCount != null || project.completedCount != null || project.sampleSize != null) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    Scheduling Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4 text-center">
                      <p className="font-bold text-2xl">
                        {project.scheduledCount ?? 0}
                      </p>
                      <p className="text-muted-foreground text-xs">Scheduled</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="font-bold text-2xl">
                        {project.completedCount ?? 0}
                      </p>
                      <p className="text-muted-foreground text-xs">Completed</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="font-bold text-2xl">
                        {project.sampleSize ?? "—"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Target Sample
                      </p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="font-bold text-2xl">
                        {project.schedulerGenerated ? "Yes" : "No"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Scheduler Active
                      </p>
                    </div>
                  </div>

                  {/* Buffers */}
                  {(project.postScreeninBuffer || project.moderatorBuffer) && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        {project.postScreeninBuffer && (
                          <div className="space-y-1">
                            <span className="font-medium text-muted-foreground text-xs">
                              Post-Screening Buffer
                            </span>
                            <p className="font-medium text-sm">
                              {project.postScreeninBuffer} hrs
                            </p>
                          </div>
                        )}
                        {project.moderatorBuffer && (
                          <div className="space-y-1">
                            <span className="font-medium text-muted-foreground text-xs">
                              Moderator Buffer
                            </span>
                            <p className="font-medium text-sm">
                              {project.moderatorBuffer} hrs
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* MRA details card */}
            {!isLS && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                    Project Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground text-xs">
                        Status ID
                      </span>
                      <p className="font-medium">{project.statusId}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground text-xs">
                        Archived
                      </span>
                      <p className="font-medium">
                        {project.isArchived ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground text-xs">
                        Private
                      </span>
                      <p className="font-medium">
                        {project.isPrivate ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-muted-foreground text-xs">
                        Subscription ID
                      </span>
                      <p className="font-medium">
                        {project.subscriptionId ?? "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProjectDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProjectDetailsInner />
    </Suspense>
  );
}
