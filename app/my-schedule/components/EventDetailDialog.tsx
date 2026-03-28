"use client";

import {
  CalendarIcon,
  ClockIcon,
  CopyIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  VideoIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { CalendarEvent } from "../data";

// ── Native date helpers ───────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseISOLocal(iso: string): Date {
  // "2026-03-12T09:00" → local Date
  const [datePart, timePart] = iso.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, m] = timePart.split(":").map(Number);
  return new Date(y, mo - 1, d, h, m);
}

function formatFullDate(dt: Date): string {
  return `${DAY_NAMES[dt.getDay()]}, ${MONTH_NAMES[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

function formatTime12(dt: Date): string {
  const h = dt.getHours();
  const m = dt.getMinutes();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? "AM" : "PM";
  const mStr = m === 0 ? "" : `:${String(m).padStart(2, "0")}`;
  return `${h12}${mStr} ${ampm}`;
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  event: CalendarEvent | null;
  onDelete?: (id: string) => void;
  onEdit?: (event: CalendarEvent) => void;
  onInvalidate?: (id: string) => void;
  onOpenChange: (v: boolean) => void;
  open: boolean;
}

export function EventDetailDialog({
  event,
  open,
  onOpenChange,
  onDelete,
  onEdit,
  onInvalidate,
}: Props) {
  if (!event) {
    return null;
  }

  const isAvailability = event.type === "availability";
  const startDt = parseISOLocal(event.start);
  const endDt = parseISOLocal(event.end);
  const isPast = endDt < new Date();

  const handleCopyLink = () => {
    if (event.meetingLink) {
      navigator.clipboard.writeText(event.meetingLink);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2">
            <Badge
              className={
                isAvailability
                  ? "border-violet-300 bg-violet-50 text-violet-700"
                  : "border-orange-300 bg-orange-50 text-orange-700"
              }
              variant="outline"
            >
              {isAvailability ? "Availability" : "Interview"}
            </Badge>
          </div>
          <DialogTitle className="text-xl">
            {isAvailability ? event.moderator : event.project}
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="space-y-3 py-1">
          <div className="flex items-start gap-3">
            <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="font-medium text-sm">{formatFullDate(startDt)}</p>
          </div>

          <div className="flex items-start gap-3">
            <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm">
              {formatTime12(startDt)} – {formatTime12(endDt)}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm">{event.moderator}</p>
          </div>

          {!isAvailability && event.participant && (
            <div className="flex items-start gap-3">
              <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Participant</p>
                <p className="text-sm">{event.participant}</p>
              </div>
            </div>
          )}

          {!isAvailability && event.meetingLink && (
            <div className="flex items-start gap-3">
              <VideoIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs">Meeting link</p>
                <a
                  className="block truncate text-primary text-sm hover:underline"
                  href={event.meetingLink}
                  rel="noreferrer"
                  target="_blank"
                >
                  {event.meetingLink}
                </a>
              </div>
            </div>
          )}

          {isAvailability && event.project && (
            <div className="flex items-start gap-3">
              <LinkIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Project</p>
                <p className="text-sm">{event.project}</p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="gap-2 sm:gap-2">
          {isPast ? null : isAvailability ? (
            <>
              <Button
                className="gap-1.5"
                onClick={() => {
                  onEdit?.(event);
                  onOpenChange(false);
                }}
                size="sm"
                variant="outline"
              >
                <PencilIcon className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                className="gap-1.5"
                onClick={() => {
                  onDelete?.(event.id);
                  onOpenChange(false);
                }}
                size="sm"
                variant="destructive"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                className="gap-1.5"
                onClick={handleCopyLink}
                size="sm"
                variant="outline"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                Copy link
              </Button>
              <Button
                className="gap-1.5"
                onClick={() => {
                  onInvalidate?.(event.id);
                  onOpenChange(false);
                }}
                size="sm"
                variant="destructive"
              >
                <XCircleIcon className="h-3.5 w-3.5" />
                Invalidate
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
