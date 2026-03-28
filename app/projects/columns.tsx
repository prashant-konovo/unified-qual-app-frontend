"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Copy,
  ExternalLink,
  FileText,
  Folder,
  MoreHorizontal,
  Trash2,
  Upload,
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

export type Project = {
  id: string;
  name: string;
  status: "Draft" | "In Progress" | "Completed" | "Archived";
  owner: string;
  lastUpdated: string;
  updatedAgo: string;
  subscriptionId?: string;
  subscriptionName?: string;
  surveyId?: string;
  surveyTitle?: string;
  surveyStatus?: string;
};

export const getColumns = (actions: {
  onDuplicate: (project: Project) => void;
  onDelete: (project: Project) => void;
}): ColumnDef<Project>[] => [
  {
    accessorKey: "name",
    header: "Project Name",
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex items-start gap-3">
          <Folder className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col">
            <Link
              className="cursor-pointer font-medium text-foreground hover:underline"
              href={`/projects/${project.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              {project.name}
            </Link>
            <span className="mt-1 text-muted-foreground text-xs">
              Updated {project.updatedAgo} ago
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "default";

      if (status === "Draft") {
        variant = "secondary";
      } else if (status === "In Progress") {
        variant = "default";
      } else if (status === "Completed") {
        variant = "outline";
      } else if (status === "Archived") {
        variant = "destructive";
      }

      return (
        <Badge
          className={
            status === "Completed"
              ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400"
              : ""
          }
          variant={variant}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "owner",
    header: "Owner",
  },
  {
    accessorKey: "subscriptionName",
    header: "Subscription",
    cell: ({ row }) => {
      const sub = row.original.subscriptionName;
      const subId = row.original.subscriptionId;
      if (!sub) {
        return <span className="text-muted-foreground text-xs">—</span>;
      }
      return subId ? (
        <Link
          className="font-medium text-xs hover:underline"
          href={"/subscriptions"}
          onClick={(e) => e.stopPropagation()}
        >
          {sub}
        </Link>
      ) : (
        <span className="font-medium text-xs">{sub}</span>
      );
    },
  },
  {
    accessorKey: "surveyTitle",
    header: "Survey",
    cell: ({ row }) => {
      const title = row.original.surveyTitle;
      const surveyId = row.original.surveyId;
      const surveyStatus = row.original.surveyStatus;
      if (!surveyId) {
        return <span className="text-muted-foreground text-xs">—</span>;
      }
      return (
        <Link
          className="flex items-center gap-1.5 text-xs hover:underline"
          href={`/survey-builder?id=${surveyId}`}
          onClick={(e) => e.stopPropagation()}
        >
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="font-medium">{title || "Survey"}</span>
          {surveyStatus === "published" && (
            <Badge
              className="ml-1 border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-600"
              variant="default"
            >
              Published
            </Badge>
          )}
        </Link>
      );
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original;
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
              <Link className="cursor-pointer" href={`/projects/${project.id}`}>
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
            <DropdownMenuItem className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Upload Interview Guide
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
