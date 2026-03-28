"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../data";
import { DayColumn } from "./DayColumn";
import { TimeColumn } from "./TimeColumn";

// ── Native date helpers ───────────────────────────────────────────────────────

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

function isSameDay(a: Date, b: Date): boolean {
  return toDateStr(a) === toDateStr(b);
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDayHeader(d: Date) {
  return {
    dayLabel: DAY_LABELS[d.getDay()],
    dateNum: d.getDate(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  onDragCreate: (range: { date: Date; start: string; end: string }) => void;
  onEventClick: (event: CalendarEvent) => void;
  view: "week" | "day";
}

function getDays(date: Date, view: "week" | "day"): Date[] {
  if (view === "day") {
    return [date];
  }
  const weekStart = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const dayStr = toDateStr(day);
  return events.filter((ev) => ev.start.startsWith(dayStr));
}

export function CalendarGrid({
  currentDate,
  view,
  events,
  onEventClick,
  onDragCreate,
}: Props) {
  const days = getDays(currentDate, view);
  const today = new Date();

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-background">
      {/* Day headers — sticky */}
      <div className="sticky top-0 z-30 flex border-border border-b bg-muted/30">
        {/* Spacer for time column */}
        <div className="w-16 shrink-0 border-border border-r" />
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const { dayLabel, dateNum } = formatDayHeader(day);
          return (
            <div
              className={cn(
                "min-w-[120px] flex-1 border-border border-r px-3 py-2 text-center last:border-r-0",
                isToday && "bg-primary/5"
              )}
              key={day.toISOString()}
            >
              <div className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
                {dayLabel}
              </div>
              <div
                className={cn(
                  "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full font-semibold text-base",
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                {dateNum}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable grid body */}
      <div className="flex flex-1 overflow-y-auto overflow-x-hidden">
        <TimeColumn />
        <div className="flex flex-1">
          {days.map((day) => (
            <DayColumn
              date={day}
              events={getEventsForDay(events, day)}
              key={day.toISOString()}
              onDragCreate={onDragCreate}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
