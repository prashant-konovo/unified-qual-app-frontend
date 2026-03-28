"use client";

import {
  CalendarDays,
  Clock,
  Loader2,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ModeratorFormDialog } from "@/components/moderators/moderator-form-dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Moderator } from "@/lib/api/moderators";
import { moderatorsApi } from "@/lib/api/moderators";

function formatDate(dateStr?: string) {
  if (!dateStr) {
    return "Never";
  }
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ModeratorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [moderator, setModerator] = useState<Moderator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    moderatorsApi
      .getModerator(id)
      .then(setModerator)
      .catch(() => toast.error("Failed to load moderator"))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!moderator) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-50/50 dark:bg-zinc-950/20">
        <h2 className="font-semibold text-xl">Moderator not found</h2>
        <Button asChild>
          <Link href="/moderators">Back to Moderators</Link>
        </Button>
      </div>
    );
  }

  const isActive = moderator.status === "active";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator className="mr-2 h-4" orientation="vertical" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/moderators">Moderators</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold">
                {moderator.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 bg-zinc-50/50 p-4 md:p-8 dark:bg-zinc-950/20">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Page title bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-bold text-2xl tracking-tight">
                  {moderator.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      isActive
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                        : "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    }
                    variant="outline"
                  >
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge className="capitalize" variant="secondary">
                    {moderator.role}
                  </Badge>
                </div>
              </div>
            </div>
            <Button onClick={() => setEditOpen(true)} variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Moderator
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-medium text-sm">{moderator.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <p className="font-medium text-sm">
                      {moderator.phone || "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Member since
                    </p>
                    <p className="font-medium text-sm">
                      {formatDate(moderator.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Last active</p>
                    <p className="font-medium text-sm">
                      {formatDate(moderator.lastActive)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ModeratorFormDialog
        moderator={moderator}
        onOpenChange={setEditOpen}
        onSuccess={(updated) => setModerator(updated)}
        open={editOpen}
      />
    </div>
  );
}
