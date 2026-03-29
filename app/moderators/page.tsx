"use client";

import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ModeratorFormDialog } from "@/components/moderators/moderator-form-dialog";
import { ModeratorsTable } from "@/components/moderators/moderators-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import type { Moderator } from "@/lib/api/moderators";
import { moderatorsApi } from "@/lib/api/moderators";

export default function ModeratorsPage() {
  const [data, setData] = useState<Moderator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingModerator, setEditingModerator] = useState<
    Moderator | undefined
  >();
  const [deleteTarget, setDeleteTarget] = useState<Moderator | null>(null);

  const fetchModerators = useCallback(async () => {
    try {
      const result = await moderatorsApi.getModeratorsList();
      setData(result);
    } catch {
      toast.error("Failed to load moderators");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModerators();
  }, [fetchModerators]);

  const handleEdit = (mod: Moderator) => {
    setEditingModerator(mod);
    setFormOpen(true);
  };

  const handleFormSuccess = (mod: Moderator) => {
    setData((prev) => {
      const idx = prev.findIndex((m) => m.id === mod.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = mod;
        return next;
      }
      return [mod, ...prev];
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await moderatorsApi.deleteModerator(deleteTarget.id);
      setData((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name} deleted`);
    } catch {
      toast.error("Failed to delete moderator");
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.phone ?? "").includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }
    return result;
  }, [data, search, statusFilter]);

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
                  Moderators
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
                Moderators
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                Manage moderators and their availability
              </p>
            </div>

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
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ModeratorsTable
              data={filteredData}
              onDelete={setDeleteTarget}
              onEdit={handleEdit}
            />
          )}
        </div>
      </main>

      {/* Create / Edit Dialog */}
      <ModeratorFormDialog
        moderator={editingModerator}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
        open={formOpen}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Moderator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
