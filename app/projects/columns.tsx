"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Copy,
  ExternalLink,
  Folder,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectListItem } from "@/lib/api/projects";

// Re-export for page.tsx
export type { ProjectListItem };

/** Map status string to badge style */
function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  const s = status.toLowerCase();
  if (s === "defining" || s === "draft" || s === "inquiry") return "secondary";
  if (s === "in progress" || s === "fielding") return "default";
  if (s === "complete" || s === "completed") return "outline";
  if (s === "paused" || s === "finalizing") return "destructive";
  return "default";
}

function isCompletedStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === "complete" || s === "completed";
}

/** Human-readable relative time */
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

export const getColumns = (actions: {
  onDuplicate: (project: ProjectListItem) => void;
  onDelete: (project: ProjectListItem) => void;
}): ColumnDef<ProjectListItem>[] => [
  {
    accessorKey: "name",
    header: "Project Name",
    cell: ({ row }) => {
      const p = row.original;
      const sourceParam = p.source ? `?source=${p.source}` : "";
      return (
        <div className="flex items-start gap-3">
          <Folder className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col">
            <Link
              className="cursor-pointer font-medium text-foreground hover:underline"
              href={`/projects/${p.id}${sourceParam}`}
              onClick={(e) => e.stopPropagation()}
            >
              {p.name}
            </Link>
            <span className="mt-1 text-muted-foreground text-xs">
              {p.modifiedAt
                ? `Updated ${timeAgo(p.modifiedAt)} ago`
                : `Created ${timeAgo(p.createdAt)} ago`}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "serviceCategory",
    header: "Type",
    cell: ({ row }) => {
      const sc = row.original.serviceCategory;
      return (
        <Badge variant={sc === "LS" ? "default" : "secondary"}>
          {sc}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      if (!status) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <Badge
          className={
            isCompletedStatus(status)
              ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400"
              : ""
          }
          variant={statusVariant(status)}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "company",
    header: "Company",
    cell: ({ row }) => {
      const p = row.original;
      const company =
        p.subscriptionCompany ?? p.clientCompany ?? null;
      if (!company)
        return <span className="text-muted-foreground text-xs">—</span>;
      return <span className="text-sm">{company}</span>;
    },
  },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const p = row.original;
      const sample = p.sampleSize ?? 0;
      const completed = p.completedCount ?? 0;
      const scheduled = p.scheduledCount ?? 0;
      if (!sample && !completed && !scheduled) {
        return <span className="text-muted-foreground text-xs">—</span>;
      }
      return (
        <div className="flex flex-col text-xs">
          <span>
            {completed}/{sample || "?"} completed
          </span>
          <span className="text-muted-foreground">{scheduled} scheduled</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const d = row.original.createdAt;
      if (!d) return "—";
      return (
        <span className="text-sm">
          {new Date(d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original;
      const sourceParam = project.source ? `?source=${project.source}` : "";
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0 hover:bg-muted" variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link
                className="cursor-pointer"
                href={`/projects/${project.id}${sourceParam}`}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => actions.onDuplicate(project)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => actions.onDelete(project)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
