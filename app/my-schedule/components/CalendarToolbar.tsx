"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function addWeeks(d: Date, n: number): Date {
  return addDays(d, n * 7);
}

function getWeekStart(d: Date): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay()); // Sunday
  return r;
}

function formatDateLabel(d: Date, view: "week" | "day"): string {
  if (view === "day") {
    return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  // Week view: "Week of March 10, 2026"
  const ws = getWeekStart(d);
  return `Week of ${MONTH_NAMES[ws.getMonth()]} ${ws.getDate()}, ${ws.getFullYear()}`;
}

// ─────────────────────────────────────────────────────────────────────────────

type View = "week" | "day";

interface Props {
  currentDate: Date;
  onDateChange: (d: Date) => void;
  onToday: () => void;
  onViewChange: (v: View) => void;
  view: View;
}

export function CalendarToolbar({
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onToday,
}: Props) {
  const handlePrev = () => {
    onDateChange(
      view === "week" ? addWeeks(currentDate, -1) : addDays(currentDate, -1)
    );
  };

  const handleNext = () => {
    onDateChange(
      view === "week" ? addWeeks(currentDate, 1) : addDays(currentDate, 1)
    );
  };

  const dateLabel = formatDateLabel(currentDate, view);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Left: navigation */}
      <div className="flex items-center gap-2">
        <Button onClick={onToday} size="sm" variant="outline">
          Today
        </Button>
        <div className="flex items-center">
          <Button
            className="h-8 w-8"
            onClick={handlePrev}
            size="icon"
            variant="ghost"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            className="h-8 w-8"
            onClick={handleNext}
            size="icon"
            variant="ghost"
          >
            <ChevronRightIcon className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
        <h2 className="font-semibold text-foreground text-sm">{dateLabel}</h2>
      </div>

      {/* Right: view switcher */}
      <Tabs onValueChange={(v) => onViewChange(v as View)} value={view}>
        <TabsList className="h-8">
          <TabsTrigger className="h-6 px-3 text-xs" value="week">
            Week
          </TabsTrigger>
          <TabsTrigger className="h-6 px-3 text-xs" value="day">
            Day
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
