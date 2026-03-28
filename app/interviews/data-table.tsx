"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      account: false,
      client: false,
      project: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-9 w-[150px] lg:w-[250px]"
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            placeholder="Search interviews..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          />
          <Select
            onValueChange={(value) =>
              table
                .getColumn("account")
                ?.setFilterValue(value === "all" ? "" : value)
            }
            value={
              (table.getColumn("account")?.getFilterValue() as string) ?? "all"
            }
          >
            <SelectTrigger className="h-9 w-[130px] border-dashed">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="Acme Corp">Acme Corp</SelectItem>
              <SelectItem value="Globex">Globex</SelectItem>
              <SelectItem value="Stark Industries">Stark</SelectItem>
              <SelectItem value="Wayne Enterprises">Wayne</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              table
                .getColumn("client")
                ?.setFilterValue(value === "all" ? "" : value)
            }
            value={
              (table.getColumn("client")?.getFilterValue() as string) ?? "all"
            }
          >
            <SelectTrigger className="h-9 w-[130px] border-dashed">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="Acme">Acme</SelectItem>
              <SelectItem value="Globex Inc">Globex Inc</SelectItem>
              <SelectItem value="Stark">Stark</SelectItem>
              <SelectItem value="Wayne Tech">Wayne Tech</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              table
                .getColumn("project")
                ?.setFilterValue(value === "all" ? "" : value)
            }
            value={
              (table.getColumn("project")?.getFilterValue() as string) ?? "all"
            }
          >
            <SelectTrigger className="h-9 w-[130px] border-dashed">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="Project Alpha">Project Alpha</SelectItem>
              <SelectItem value="Project Beta">Project Beta</SelectItem>
              <SelectItem value="Project Gamma">Project Gamma</SelectItem>
              <SelectItem value="Project Delta">Project Delta</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              table
                .getColumn("rewardStatus")
                ?.setFilterValue(value === "all" ? "" : value)
            }
            value={
              (table.getColumn("rewardStatus")?.getFilterValue() as string) ??
              "all"
            }
          >
            <SelectTrigger className="h-9 w-[160px] border-dashed">
              <SelectValue placeholder="Reward Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Credited">Credited</SelectItem>
              <SelectItem value="Not Credited">Not Credited</SelectItem>
            </SelectContent>
          </Select>

          {table.getState().columnFilters.length > 0 && (
            <Button
              className="h-8 px-2 text-xs lg:px-3"
              onClick={() => table.resetColumnFilters()}
              variant="ghost"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Action Trigger (Visible only when rows selected) */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 p-2">
          <span className="px-2 font-medium text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} row(s) selected
          </span>
          <Button className="h-8" size="sm" variant="default">
            Bulk Incentive
          </Button>
          <Button
            className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            size="sm"
            variant="outline"
          >
            Invalidate
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="h-11 font-semibold text-muted-foreground text-xs uppercase tracking-wider"
                      key={header.id}
                    >
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
                  className="group h-[72px] transition-colors hover:bg-muted/30"
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="py-2" key={cell.id}>
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
                  <div className="m-4 flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 p-8 text-center">
                    <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <svg
                        className="h-5 w-5 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg">No results found</h3>
                    <p className="mt-1 max-w-sm text-muted-foreground text-sm">
                      No interviews matched your selected filters. Try adjusting
                      your search or clearing the filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex-1 text-muted-foreground text-sm">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} rows.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-sm">Rows per page</p>
            <Select
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
              value={`${table.getState().pagination.pageSize}`}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center font-medium text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              className="h-8 w-8 p-0"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              variant="outline"
            >
              <span className="sr-only">Go to previous page</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </Button>
            <Button
              className="h-8 w-8 p-0"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              variant="outline"
            >
              <span className="sr-only">Go to next page</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
