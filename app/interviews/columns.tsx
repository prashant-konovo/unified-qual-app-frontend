"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Ban,
  CalendarClock,
  CheckCircle,
  Edit3,
  Link,
  MoreHorizontal,
  UserX,
  VideoIcon,
} from "lucide-react";
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
import type { Interview } from "./data";

interface ColumnCallbacks {
  onCancelInterview: (id: string) => void;
  onCreditRewards: (interview: Interview) => void;
  onInvalidate: (id: string) => void;
  onRescheduleInterview: (interview: Interview) => void;
}

export function createColumns(
  callbacks: ColumnCallbacks
): ColumnDef<Interview>[] {
  return [
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
      accessorKey: "title",
      header: "Interview",
      cell: ({ row }) => {
        const interview = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/50">
              <VideoIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{interview.title}</span>
              <span className="text-muted-foreground text-xs">
                Topic: {interview.topic}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "serviceCategory",
      header: "Brand",
      cell: ({ row }) => {
        const sc = row.getValue("serviceCategory") as string;
        return (
          <Badge
            className={
              sc === "LS"
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-sky-200 bg-sky-50 text-sky-700"
            }
            variant="outline"
          >
            {sc === "LS" ? "LS" : "MRA"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date & Time",
      cell: ({ row }) => {
        const interview = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{interview.date}</span>
            <span className="text-muted-foreground text-xs">
              {interview.timeRange}
            </span>
            <span className="text-muted-foreground text-xs">
              {interview.duration}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "moderator",
      header: "Moderator",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("moderator")}</span>
      ),
    },
    {
      accessorKey: "participantName",
      header: "Participant",
      cell: ({ row }) => {
        const interview = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {interview.participantName}
            </span>
            <span className="text-muted-foreground text-xs">
              ID: {interview.participantId}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "rewardPoints",
      header: "Reward Points",
      cell: ({ row }) => {
        return (
          <div className="group -ml-1 flex w-fit cursor-pointer items-center gap-2 rounded-md p-1 transition-colors hover:bg-muted/50">
            <span className="font-medium text-sm">
              {row.getValue("rewardPoints")} pts
            </span>
            <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        );
      },
    },
    {
      accessorKey: "rewardStatus",
      header: "Reward Status",
      cell: ({ row }) => {
        const status = row.getValue("rewardStatus") as string;
        return (
          <Badge
            className={
              status === "Credited"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }
            variant="outline"
          >
            {status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const interview = row.original;
        const isInvalidated = interview.status === "Invalidated";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {!isInvalidated && (
                <>
                  <DropdownMenuItem
                    disabled={interview.rewardStatus === "Credited"}
                    onClick={() => callbacks.onCreditRewards(interview)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>Credit Rewards</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => callbacks.onInvalidate(interview.id)}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    <span>Invalidate Interview</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => callbacks.onCancelInterview(interview.id)}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    <span>Cancel Interview</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => callbacks.onRescheduleInterview(interview)}
                  >
                    <CalendarClock className="mr-2 h-4 w-4" />
                    <span>Reschedule</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {interview.meetingLink && (
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(interview.meetingLink ?? "")
                  }
                >
                  <Link className="mr-2 h-4 w-4" />
                  <span>Copy Conference Link</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      accessorKey: "account",
      header: "Account",
      enableHiding: true,
    },
    {
      accessorKey: "client",
      header: "Client",
      enableHiding: true,
    },
    {
      accessorKey: "project",
      header: "Project",
      enableHiding: true,
    },
  ];
}
