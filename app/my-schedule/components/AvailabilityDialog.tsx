"use client";

import { ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [datePart, timePart] = iso.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, m] = timePart.split(":").map(Number);
  return new Date(y, mo - 1, d, h, m);
}

function formatDayLabel(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
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

interface DragRange {
  date: Date;
  end: string;
  start: string;
}

export interface ModeratorOption {
  id: string;
  name: string;
}
export interface ProjectOption {
  id: string;
  name: string;
}

interface Props {
  /** Existing event — present in edit mode, null in create mode. */
  event: CalendarEvent | null;
  moderators: ModeratorOption[];
  onCreate: (event: Omit<CalendarEvent, "id">, moderatorId: string) => void;
  onOpenChange: (v: boolean) => void;
  onUpdate: (
    id: string,
    changes: Partial<CalendarEvent>,
    moderatorId: string
  ) => void;
  open: boolean;
  /** ID of the moderator to pre-select in create mode (e.g. from the active filter). */
  preselectedModeratorId?: string;
  projects: ProjectOption[];
  /** Drag-selected range — present in create mode, null in edit mode. */
  range: DragRange | null;
}

// ── Dialog state helpers (extracted to reduce cognitive complexity) ───────────

function initFromEvent(
  event: CalendarEvent,
  moderators: ModeratorOption[],
  setModeratorId: (v: string) => void,
  setProject: (v: string) => void,
  setStartTime: (v: string) => void,
  setEndTime: (v: string) => void
) {
  const mod = moderators.find((m) => m.name === event.moderator);
  setModeratorId(mod?.id ?? event.moderatorId ?? "");
  setProject(event.project || "none");
  setStartTime(event.start.split("T")[1] ?? "09:00");
  setEndTime(event.end.split("T")[1] ?? "10:00");
}

function resetToDefaults(
  defaultModeratorId: string,
  projects: ProjectOption[],
  setModeratorId: (v: string) => void,
  setProject: (v: string) => void,
  setStartTime: (v: string) => void,
  setEndTime: (v: string) => void
) {
  setModeratorId(defaultModeratorId);
  setProject("none");
  setStartTime("09:00");
  setEndTime("10:00");
}

// ─────────────────────────────────────────────────────────────────────────────

export function AvailabilityDialog({
  range,
  event,
  open,
  onOpenChange,
  onCreate,
  onUpdate,
  moderators,
  projects,
  preselectedModeratorId,
}: Props) {
  const isEditMode = event !== null && range === null;

  const defaultModeratorId = preselectedModeratorId ?? moderators[0]?.id ?? "";

  const [moderatorId, setModeratorId] = useState<string>(defaultModeratorId);
  const [project, setProject] = useState<string>("none");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");

  // Sync state when the dialog opens or the target event/range changes.
  useEffect(() => {
    if (!open) {
      return;
    }
    if (isEditMode && event) {
      initFromEvent(
        event,
        moderators,
        setModeratorId,
        setProject,
        setStartTime,
        setEndTime
      );
    } else {
      resetToDefaults(
        defaultModeratorId,
        projects,
        setModeratorId,
        setProject,
        setStartTime,
        setEndTime
      );
    }
  }, [open, isEditMode, event, moderators, projects, defaultModeratorId]);

  if (!(isEditMode || range)) {
    return null;
  }

  const resolvedModeratorName =
    moderators.find((m) => m.id === moderatorId)?.name ?? "";

  const handleSubmit = () => {
    if (isEditMode && event) {
      const datePrefix = event.start.split("T")[0];
      onUpdate(
        event.id,
        {
          moderator: resolvedModeratorName,
          moderatorId,
          project: project === "none" ? undefined : project,
          start: `${datePrefix}T${startTime}`,
          end: `${datePrefix}T${endTime}`,
        },
        moderatorId
      );
    } else if (range) {
      onCreate(
        {
          type: "availability",
          moderator: resolvedModeratorName,
          moderatorId,
          start: range.start,
          end: range.end,
          project: project === "none" ? undefined : project,
        },
        moderatorId
      );
    }
    onOpenChange(false);
  };

  // Determine what to display for the time range header.
  const displayDate =
    isEditMode && event
      ? parseISOLocal(event.start)
      : (range?.date ?? new Date());

  let displayStart: Date;
  let displayEnd: Date;
  if (isEditMode && event) {
    displayStart = parseISOLocal(event.start);
    displayEnd = parseISOLocal(event.end);
  } else if (range) {
    displayStart = parseISOLocal(range.start);
    displayEnd = parseISOLocal(range.end);
  } else {
    displayStart = new Date();
    displayEnd = new Date();
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Availability" : "Create Availability"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the moderator's availability slot."
              : "Set moderator availability for the selected time range."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date / time range display */}
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
            <ClockIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{formatDayLabel(displayDate)}</p>
              {!isEditMode && (
                <p className="text-muted-foreground text-xs">
                  {formatTime12(displayStart)} – {formatTime12(displayEnd)}
                </p>
              )}
            </div>
          </div>

          {/* Time pickers – only shown in edit mode */}
          {isEditMode && (
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="font-medium text-sm" htmlFor="start-time">
                  Start time
                </label>
                <input
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  id="start-time"
                  onChange={(e) => setStartTime(e.target.value)}
                  type="time"
                  value={startTime}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="font-medium text-sm" htmlFor="end-time">
                  End time
                </label>
                <input
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  id="end-time"
                  onChange={(e) => setEndTime(e.target.value)}
                  type="time"
                  value={endTime}
                />
              </div>
            </div>
          )}

          {/* Moderator selector */}
          <div className="space-y-1.5">
            <label className="font-medium text-sm" htmlFor="moderator-select">
              Moderator
            </label>
            <Select onValueChange={setModeratorId} value={moderatorId}>
              <SelectTrigger id="moderator-select">
                <SelectValue placeholder="Select moderator" />
              </SelectTrigger>
              <SelectContent>
                {moderators.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project selector */}
          <div className="space-y-1.5">
            <label className="font-medium text-sm" htmlFor="project-select">
              Project
            </label>
            <Select onValueChange={setProject} value={project}>
              <SelectTrigger id="project-select">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditMode ? "Update Availability" : "Save Availability"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
