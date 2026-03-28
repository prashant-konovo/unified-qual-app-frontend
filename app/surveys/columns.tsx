"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Circle,
  Edit,
  FileText,
  Link2,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import Link from "next/link";
import type { Survey } from "@/app/survey-builder/types";
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

interface ColumnsProps {
  onAttach: (survey: Survey) => void;
  onDelete: (survey: Survey) => void;
}

export const getColumns = ({
  onDelete,
  onAttach,
}: ColumnsProps): ColumnDef<Survey>[] => [
  {
    accessorKey: "projectName",
    header: "Project Name",
    cell: ({ row }) => {
      const survey = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background text-muted-foreground shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <Link
              className="h-auto px-0 py-0 font-semibold text-base text-foreground hover:underline"
              href={`/survey-builder${survey.id ? `?id=${survey.id}` : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              {survey.projectName || "Untitled Survey"}
            </Link>
            <div className="text-muted-foreground text-sm">
              Target: {survey.crowdName || "Unknown Crowd"}
              {survey.projectId && (
                <>
                  {" · "}
                  <Link
                    className="hover:underline"
                    href={`/projects/${survey.projectId}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Project
                  </Link>
                </>
              )}
            </div>
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
      if (status === "published") {
        return (
          <Badge
            className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
            variant="default"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" /> Published
          </Badge>
        );
      }
      return (
        <Badge
          className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          variant="secondary"
        >
          <Circle className="mr-1 h-3 w-3" /> Draft
        </Badge>
      );
    },
  },
  {
    accessorKey: "questions",
    header: "Questions",
    cell: ({ row }) => {
      const survey = row.original;
      return (
        <span className="font-medium text-muted-foreground">
          {survey.questions?.length || 0}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const survey = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
                variant="ghost"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  className="cursor-pointer"
                  href={`/survey-builder${survey.id ? `?id=${survey.id}` : ""}`}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Survey
                </Link>
              </DropdownMenuItem>
              {survey.status === "published" && (
                <DropdownMenuItem
                  className="cursor-pointer font-medium text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 dark:text-emerald-500 dark:focus:bg-emerald-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttach(survey);
                  }}
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Attach to Project
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(survey);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
