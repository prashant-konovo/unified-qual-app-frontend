"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Participant } from "@/lib/api/participants";

export type ParticipantRowStatus =
  | "qualified"
  | "disqualified"
  | "scheduled"
  | "waiting"
  | "pending";

export interface ParticipantRow extends Participant {
  interviewStatus?: ParticipantRowStatus;
  projectName?: string;
  surveyStatus?: ParticipantRowStatus;
}

const SURVEY_BADGE: Record<string, { className: string; label: string }> = {
  disqualified: {
    className:
      "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
    label: "Disqualified",
  },
  pending: {
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
    label: "Pending",
  },
  qualified: {
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    label: "Qualified",
  },
};

const INTERVIEW_BADGE: Record<string, { className: string; label: string }> = {
  disqualified: {
    className:
      "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
    label: "Disqualified",
  },
  pending: {
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
    label: "—",
  },
  qualified: {
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
    label: "Not Scheduled",
  },
  scheduled: {
    className:
      "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
    label: "Scheduled",
  },
  waiting: {
    className:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
    label: "Waiting",
  },
};

interface ParticipantsTableProps {
  data: ParticipantRow[];
}

export function ParticipantsTable({ data }: ParticipantsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<ParticipantRow>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          className="-ml-4 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            className="font-medium text-foreground hover:underline"
            href={`/participants/${row.original.id}`}
          >
            {row.original.name}
          </Link>
          <span className="text-muted-foreground text-xs">
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "projectName",
      header: "Project",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.projectName ?? "—"}</span>
      ),
    },
    {
      accessorKey: "surveyStatus",
      header: "Survey",
      cell: ({ row }) => {
        const key = row.original.surveyStatus ?? "pending";
        const badge = SURVEY_BADGE[key] ?? SURVEY_BADGE.pending;
        return (
          <Badge className={badge.className} variant="outline">
            {badge.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "interviewStatus",
      header: "Interview",
      cell: ({ row }) => {
        const key = row.original.interviewStatus ?? "pending";
        const badge = INTERVIEW_BADGE[key] ?? INTERVIEW_BADGE.pending;
        return (
          <Badge className={badge.className} variant="outline">
            {badge.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 w-8 p-0" variant="ghost">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    className="cursor-pointer"
                    href={`/participants/${p.id}`}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    className="cursor-pointer"
                    href={`/schedule/${p.id}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Slot Picker
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="py-12 text-center text-muted-foreground"
                  colSpan={columns.length}
                >
                  No participants found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-muted-foreground text-sm">
        <span>
          {table.getFilteredRowModel().rows.length} participant
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </span>
        <div className="flex gap-2">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
