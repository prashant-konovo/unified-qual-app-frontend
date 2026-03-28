"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../data";
import { EventBlock } from "./EventBlock";

import { END_HOUR, START_HOUR } from "./TimeColumn";

const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;
const PX_PER_MINUTE = 16 / 15;

function timeToY(timeStr: string): number {
  const timePart = timeStr.split("T")[1];
  const [h, m] = timePart.split(":").map(Number);
  const totalMin = h * 60 + m - START_HOUR * 60;
  return Math.max(0, totalMin) * PX_PER_MINUTE;
}

function timeToMinutes(timeStr: string): number {
  const timePart = timeStr.split("T")[1];
  const [h, m] = timePart.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeStr(dateStr: string, totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${dateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function snapTo15(min: number): number {
  return Math.round(min / 15) * 15;
}

type DragState = {
  startMin: number;
  endMin: number;
} | null;

interface Props {
  date: Date;
  events: CalendarEvent[];
  onDragCreate: (range: { date: Date; start: string; end: string }) => void;
  onEventClick: (event: CalendarEvent) => void;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

export function DayColumn({ date, events, onEventClick, onDragCreate }: Props) {
  const dateStr = toDateStr(date);
  const totalSlots = (END_HOUR - START_HOUR) * 4;
  const totalHeight = totalSlots * 16;

  const [drag, setDrag] = React.useState<DragState>(null);
  const [hoverMin, setHoverMin] = React.useState<number | null>(null);
  const colRef = React.useRef<HTMLDivElement>(null);

  function yToMin(clientY: number): number {
    const rect = colRef.current?.getBoundingClientRect();
    if (!rect) {
      return START_HOUR * 60;
    }
    const relY = clientY - rect.top;
    const rawMin = (relY / totalHeight) * TOTAL_MINUTES + START_HOUR * 60;
    return Math.min(Math.max(snapTo15(rawMin), START_HOUR * 60), END_HOUR * 60);
  }

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const min = yToMin(e.clientY);
    setDrag({ startMin: min, endMin: min });
  }

  function handleMouseMove(e: React.MouseEvent) {
    const min = yToMin(e.clientY);
    setHoverMin(min);
    if (drag) {
      setDrag((d) => (d ? { ...d, endMin: min } : d));
    }
  }

  function handleMouseUp() {
    if (drag) {
      const s = Math.min(drag.startMin, drag.endMin);
      const en = Math.max(drag.startMin, drag.endMin);
      if (en > s) {
        onDragCreate({
          date,
          start: minutesToTimeStr(dateStr, s),
          end: minutesToTimeStr(dateStr, en),
        });
      }
      setDrag(null);
    }
  }

  const dragTop = drag
    ? (Math.min(drag.startMin, drag.endMin) - START_HOUR * 60) * PX_PER_MINUTE
    : 0;
  const dragHeight = drag
    ? Math.abs(drag.endMin - drag.startMin) * PX_PER_MINUTE
    : 0;

  return (
    <div
      className="relative min-w-[120px] flex-1 cursor-crosshair select-none border-border border-r"
      onMouseDown={handleMouseDown}
      onMouseLeave={() => {
        setHoverMin(null);
        if (drag) {
          handleMouseUp();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={colRef}
      style={{ height: totalHeight }}
    >
      {/* 15-min grid lines */}
      {Array.from({ length: totalSlots }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static grid
          className={cn(
            "absolute w-full",
            i % 4 === 0 ? "border-border border-t" : "border-border/30 border-t"
          )}
          key={i}
          style={{ top: i * 16 }}
        />
      ))}

      {/* Hover highlight */}
      {hoverMin !== null && !drag && (
        <div
          className="pointer-events-none absolute inset-x-0 h-4 bg-primary/5"
          style={{ top: (hoverMin - START_HOUR * 60) * PX_PER_MINUTE }}
        />
      )}

      {/* Drag selection overlay */}
      {drag && dragHeight > 0 && (
        <div
          className="pointer-events-none absolute inset-x-1 z-10 rounded border border-violet-400 bg-violet-500/20"
          style={{ top: dragTop, height: dragHeight }}
        />
      )}

      {/* Events */}
      {events.map((ev) => {
        const top = timeToY(ev.start);
        const startMin = timeToMinutes(ev.start);
        const endMin = timeToMinutes(ev.end);
        const height = Math.max((endMin - startMin) * PX_PER_MINUTE, 20);

        return (
          <EventBlock
            event={ev}
            height={height}
            key={ev.id}
            onClick={() => onEventClick(ev)}
            top={top}
          />
        );
      })}
    </div>
  );
}
