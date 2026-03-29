"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { moderatorsApi } from "@/lib/api/moderators";
import { projectsApi } from "@/lib/api/projects";
import type { Timeslot } from "@/lib/api/timeslots";
import { timeslotsApi } from "@/lib/api/timeslots";
import type {
  ModeratorOption,
  ProjectOption,
} from "./components/AvailabilityDialog";
import { AvailabilityDialog } from "./components/AvailabilityDialog";
import { AISuggestionsPanel } from "./components/ai-suggestions-panel";
import { CalendarGrid } from "./components/CalendarGrid";
import { CalendarToolbar } from "./components/CalendarToolbar";
import { EventDetailDialog } from "./components/EventDetailDialog";
import { FiltersBar } from "./components/FiltersBar";
import { type CalendarEvent, TIMEZONES } from "./data";

// ── Date utilities ────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getWeekStart(d: Date): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay()); // Sunday
  return r;
}

// ── Mapping helper ────────────────────────────────────────────────────────────

function slotToEvent(slot: Timeslot): CalendarEvent {
  return {
    id: slot.id,
    moderatorId: slot.moderatorId,
    type: slot.type,
    moderator: slot.moderatorName,
    start: slot.start,
    end: slot.end,
    project: slot.project,
    participant: slot.participant,
    meetingLink: slot.meetingLink,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

interface DragRange {
  date: Date;
  end: string;
  start: string;
}

export default function Page() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<"week" | "day">("week");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [moderatorFilter, setModeratorFilter] = useState<string>("all");
  const [timezone, setTimezone] = useState<string>(TIMEZONES[0].value);
  const [timeBuffer, setTimeBuffer] = useState<number>(15);

  // Remote data
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [moderators, setModerators] = useState<ModeratorOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Event detail dialog
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);

  // Availability create / edit dialog
  const [dragRange, setDragRange] = useState<DragRange | null>(null);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [availOpen, setAvailOpen] = useState(false);

  // ── Fetch moderators on mount ─────────────────────────────────────────────
  useEffect(() => {
    moderatorsApi
      .getModeratorsList("active")
      .then((mods) => {
        setModerators(mods.map((m) => ({ id: m.id, name: m.name })));
      })
      .catch(() => {
        toast.error("Failed to load moderators");
      });
  }, []);

  // ── Fetch projects on mount ───────────────────────────────────────────────
  useEffect(() => {
    projectsApi
      .getProjectsList()
      .then((projs) => {
        setProjects(
          projs.map((p) => ({ id: String(p.id), name: p.name }))
        );
      })
      .catch(() => {
        toast.error("Failed to load projects");
      });
  }, []);

  // ── Fetch timeslots for visible week ─────────────────────────────────────
  useEffect(() => {
    const weekStart = getWeekStart(currentDate);
    const weekEnd = addDays(weekStart, 6);
    const from = toDateStr(weekStart);
    const to = toDateStr(weekEnd);

    setIsLoadingEvents(true);
    timeslotsApi
      .getTimeslots({ from, to })
      .then((slots) => {
        setEvents(slots.map(slotToEvent));
      })
      .catch(() => {
        toast.error("Failed to load schedule");
      })
      .finally(() => {
        setIsLoadingEvents(false);
      });
  }, [currentDate]);

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  }, []);

  const handleDragCreate = useCallback((range: DragRange) => {
    setDragRange(range);
    setEditEvent(null);
    setAvailOpen(true);
  }, []);

  const handleEdit = useCallback((event: CalendarEvent) => {
    setEditEvent(event);
    setDragRange(null);
    setAvailOpen(true);
  }, []);

  const handleCreateAvailability = useCallback(
    async (ev: Omit<CalendarEvent, "id">, moderatorId: string) => {
      try {
        const slot = await timeslotsApi.createTimeslot({
          moderatorId,
          moderatorName: ev.moderator,
          type: ev.type,
          start: ev.start,
          end: ev.end,
          project: ev.project,
        });
        setEvents((prev) => [...prev, slotToEvent(slot)]);
        toast.success("Availability saved");
      } catch {
        toast.error("Failed to save availability");
      }
    },
    []
  );

  const handleUpdateAvailability = useCallback(
    async (
      id: string,
      changes: Partial<CalendarEvent>,
      moderatorId: string
    ) => {
      try {
        const slot = await timeslotsApi.updateTimeslot(id, {
          moderatorId,
          moderatorName: changes.moderator,
          type: changes.type,
          start: changes.start,
          end: changes.end,
          project: changes.project,
        });
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? slotToEvent(slot) : e))
        );
        toast.success("Availability updated");
      } catch {
        toast.error("Failed to update availability");
      }
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await timeslotsApi.deleteTimeslot(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Timeslot deleted");
    } catch {
      toast.error("Failed to delete timeslot");
    }
  }, []);

  const handleInvalidate = useCallback(async (id: string) => {
    // Invalidating an interview slot soft-deletes it from the calendar.
    try {
      await timeslotsApi.deleteTimeslot(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Interview invalidated");
    } catch {
      toast.error("Failed to invalidate interview");
    }
  }, []);

  const handleImport = useCallback((_file: File) => {
    toast.info("CSV import is not yet implemented");
  }, []);

  const handleCreateSuggestedSlots = useCallback(
    async (suggestions: import("@/lib/api/timeslots").AISuggestedSlot[]) => {
      if (moderatorFilter === "all" || moderators.length === 0) {
        toast.error(
          "Select a moderator in the filters before creating suggested slots"
        );
        return;
      }
      const mod = moderators.find((m) => m.name === moderatorFilter);
      if (!mod) {
        return;
      }
      for (const s of suggestions) {
        try {
          const slot = await timeslotsApi.createTimeslot({
            moderatorId: mod.id,
            moderatorName: mod.name,
            type: "availability",
            start: s.suggestedStart,
            end: s.suggestedEnd,
          });
          setEvents((prev) => [...prev, slotToEvent(slot)]);
        } catch {
          toast.error(`Failed to create slot at ${s.suggestedStart}`);
        }
      }
      toast.success("Suggested slots created");
    },
    [moderatorFilter, moderators]
  );

  // Apply client-side filters on top of the fetched data
  const filteredEvents = events.filter((ev) => {
    const matchProject =
      projectFilter === "all" || ev.project === projectFilter;
    const matchModerator =
      moderatorFilter === "all" || ev.moderator === moderatorFilter;
    return matchProject && matchModerator;
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Page header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
          <div className="flex w-full items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Moderator Calendar</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-0 overflow-hidden">
          {/* Title + description bar */}
          <div className="border-b bg-background px-6 pt-5 pb-4">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold text-2xl tracking-tight">
                  Moderator Calendar
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                  Manage moderator availability and scheduled interviews.
                </p>
              </div>
            </div>

            {/* Toolbar */}
            <CalendarToolbar
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onToday={() => setCurrentDate(new Date())}
              onViewChange={setView}
              view={view}
            />
          </div>

          {/* Filters bar */}
          <div className="border-b bg-muted/20 px-6 py-3">
            <FiltersBar
              moderatorFilter={moderatorFilter}
              moderators={moderators}
              onImport={handleImport}
              onModeratorChange={setModeratorFilter}
              onProjectChange={setProjectFilter}
              onTimeBufferChange={setTimeBuffer}
              onTimezoneChange={setTimezone}
              projectFilter={projectFilter}
              projects={projects}
              timeBuffer={timeBuffer}
              timezone={timezone}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 border-b bg-background px-6 py-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm border border-violet-300 bg-violet-200" />
              <span className="text-muted-foreground text-xs">
                Availability
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm border border-orange-300 bg-orange-200" />
              <span className="text-muted-foreground text-xs">Interview</span>
            </div>
            {isLoadingEvents && (
              <span className="ml-2 text-muted-foreground text-xs">
                Loading…
              </span>
            )}
            <div className="ml-auto text-muted-foreground text-xs">
              Tip: Click &amp; drag to create new availability
            </div>
          </div>

          {/* Calendar grid + AI panel */}
          <div className="flex flex-1 gap-4 overflow-hidden px-6 py-4">
            <div className="flex-1 overflow-hidden">
              <CalendarGrid
                currentDate={currentDate}
                events={filteredEvents}
                onDragCreate={handleDragCreate}
                onEventClick={handleEventClick}
                view={view}
              />
            </div>
            <div className="hidden w-72 shrink-0 xl:block">
              <AISuggestionsPanel
                onCreateSlots={handleCreateSuggestedSlots}
                projects={projects}
              />
            </div>
          </div>
        </div>

        {/* Event detail dialog */}
        <EventDetailDialog
          event={selectedEvent}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onInvalidate={handleInvalidate}
          onOpenChange={setDetailOpen}
          open={detailOpen}
        />

        {/* Availability create / edit dialog */}
        <AvailabilityDialog
          event={editEvent}
          moderators={moderators}
          onCreate={handleCreateAvailability}
          onOpenChange={(v) => {
            setAvailOpen(v);
            if (!v) {
              setDragRange(null);
              setEditEvent(null);
            }
          }}
          onUpdate={handleUpdateAvailability}
          open={availOpen}
          preselectedModeratorId={
            moderatorFilter === "all"
              ? undefined
              : moderators.find((m) => m.name === moderatorFilter)?.id
          }
          projects={projects}
          range={dragRange}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
