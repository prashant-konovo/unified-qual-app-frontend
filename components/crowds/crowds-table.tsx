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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { Crowd } from "@/app/crowds/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export const columns: ColumnDef<Crowd>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        className="translate-y-[2px]"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        className="translate-y-[2px]"
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-4 h-8 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex max-w-[200px] cursor-pointer flex-col lg:max-w-xs">
        <span className="truncate font-medium text-primary/90">
          {row.getValue("name")}
        </span>
        <span
          className="truncate text-muted-foreground text-xs"
          title={row.original.description}
        >
          {row.original.description}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-mono text-muted-foreground/75 text-xs">
        {row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "members",
    header: "Members",
    cell: ({ row }) => (
      <div className="font-semibold text-emerald-600 text-sm dark:text-emerald-400">
        {row.getValue("members")}
      </div>
    ),
  },
  {
    accessorKey: "expectedCompletes",
    header: "Exp. Completes",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 font-medium text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
        {row.getValue("expectedCompletes")}
      </span>
    ),
  },
  {
    accessorKey: "subscription",
    header: "Subscription",
    cell: ({ row }) => (
      <span className="cursor-pointer text-indigo-600 text-sm hover:underline dark:text-indigo-400">
        {row.getValue("subscription")}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge
          variant={
            type === "Profile"
              ? "default"
              : type === "Employee"
                ? "outline"
                : "secondary"
          }
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "panels",
    header: "Panel",
    cell: ({ row }) => {
      const panels = row.getValue("panels") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {panels.map((p, i) => (
            <Badge
              className="whitespace-nowrap bg-muted/30 font-normal text-xs"
              key={i}
              variant="outline"
            >
              {p}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const crowd = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(crowd.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Crowd</DropdownMenuItem>
            <DropdownMenuItem>Edit Crowd</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete Crowd
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface CrowdsTableProps {
  data: Crowd[];
}

export function CrowdsTable({ data }: CrowdsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      {Object.keys(rowSelection).length > 0 && (
        <div className="fade-in zoom-in-95 flex animate-in items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 duration-200">
          <span className="ml-2 font-medium text-sm">
            {Object.keys(rowSelection).length} row(s) selected
          </span>
          <div className="ml-auto">
            <Button size="sm" variant="destructive">
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      <div className="w-full overflow-hidden rounded-md border bg-card">
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className="transition-colors hover:bg-muted/50"
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                  >
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
                    className="h-24 text-center"
                    colSpan={columns.length}
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="w-full text-center text-muted-foreground text-sm sm:w-auto sm:text-left">
          Showing {table.getRowModel().rows.length} of {data.length} crowds.
        </div>
        <div className="flex items-center space-x-2">
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
