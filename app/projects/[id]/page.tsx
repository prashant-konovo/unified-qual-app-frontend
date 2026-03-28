"use client";

import {
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Link2,
  Loader2,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { projectsApi } from "@/lib/api/projects";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProject() {
      if (!id) {
        return;
      }
      try {
        const data = await projectsApi.getProject(id as string);
        setProject(data);
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProject();
  }, [id]);

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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <h1 className="font-bold text-3xl tracking-tight">
                {project.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Badge
                  variant={project.status === "Draft" ? "secondary" : "default"}
                >
                  {project.status}
                </Badge>
                <span>•</span>
                <span>Owned by {project.owner || "Unknown"}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {project.surveyId && (
                <Button asChild variant="outline">
                  <Link href={`/survey-builder?id=${project.surveyId}`}>
                    <Link2 className="mr-2 h-4 w-4" />
                    View Attached Survey
                  </Link>
                </Button>
              )}
              <Button>Launch Study</Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
                      <Clock className="h-3.5 w-3.5" /> Interview Length
                    </span>
                    <p className="font-medium">
                      {project.interviewLength
                        ? `${project.interviewLength} mins`
                        : "Not set"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
                      <Calendar className="h-3.5 w-3.5" /> Deadline
                    </span>
                    <p className="font-medium">
                      {project.recruitmentDate || "Not set"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground text-sm">
                    Linked Survey
                  </span>
                  {project.surveyId ? (
                    <div className="flex items-center gap-2">
                      <Link
                        className="flex items-center gap-1.5 font-medium hover:underline"
                        href={`/survey-builder?id=${project.surveyId}`}
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {project.surveyTitle || "View Survey"}
                      </Link>
                      {project.surveyStatus === "published" && (
                        <Badge
                          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                          variant="default"
                        >
                          Published
                        </Badge>
                      )}
                      {project.surveyStatus === "draft" && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                  ) : (
                    <p className="font-medium">None</p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground text-sm">
                    Subscription
                  </span>
                  <p className="font-medium">
                    {project.subscriptionName ? (
                      <Link className="hover:underline" href="/subscriptions">
                        {project.subscriptionName}
                      </Link>
                    ) : (
                      "None"
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground text-sm">
                    Salesforce Reference
                  </span>
                  <p className="font-medium">
                    {project.salesforceProject || "None"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
                    <Video className="h-3.5 w-3.5" /> Conference Platform
                  </span>
                  <p className="font-medium capitalize">
                    {project.conferenceType && project.conferenceType !== "none"
                      ? project.conferenceType.replace("_", " ")
                      : "Not specified"}
                  </p>
                </div>

                {project.conferenceLink && (
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
                      <Link2 className="h-3.5 w-3.5" /> Conference Link
                    </span>
                    <a
                      className="inline-flex items-center gap-1.5 font-medium text-primary text-sm hover:underline"
                      href={project.conferenceLink}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {project.conferenceLink}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground text-sm">
                    Notes
                  </span>
                  <p className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/50 p-3 text-sm">
                    {project.notes || "No notes provided."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Participant Groups
                </CardTitle>
                <CardDescription>
                  Target audiences for this study.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.participantGroups &&
                project.participantGroups.length > 0 ? (
                  <ul className="space-y-3">
                    {project.participantGroups.map(
                      (group: any, idx: number) => (
                        <li
                          className="flex flex-col justify-between rounded-lg border bg-card p-3 sm:flex-row sm:items-center"
                          key={idx}
                        >
                          <div className="space-y-0.5">
                            <p className="font-medium text-sm">
                              {group.crowdName || "Unnamed Group"}
                            </p>
                            <p className="text-muted-foreground text-xs capitalize">
                              {group.profession || "Any role"}
                            </p>
                          </div>
                          <Badge
                            className="mt-2 w-fit sm:mt-0"
                            variant="secondary"
                          >
                            {group.sampleSize} participants
                          </Badge>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No participant groups defined.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
