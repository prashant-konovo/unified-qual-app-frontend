"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../data";

interface Props {
  event: CalendarEvent;
  height: number;
  onClick: () => void;
  top: number;
}

function formatTime(iso: string): string {
  const timePart = iso.split("T")[1];
  const [h, m] = timePart.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? "am" : "pm";
  const mStr = m === 0 ? "" : `:${String(m).padStart(2, "0")}`;
  return `${h12}${mStr}${ampm}`;
}

export function EventBlock({ event, top, height, onClick }: Props) {
  const isAvailability = event.type === "availability";
  const isPast = event.end < new Date().toISOString().slice(0, 16);

  return (
    <button
      className={cn(
        "absolute inset-x-0.5 z-10 overflow-hidden rounded px-1.5 py-0.5 text-left text-xs",
        "border transition-all duration-100",
        isPast
          ? "cursor-default border-zinc-200 bg-zinc-100 text-zinc-400 opacity-60"
          : cn(
              "cursor-pointer hover:brightness-95 active:scale-[0.98]",
              isAvailability
                ? "border-violet-300 bg-violet-100 text-violet-900 hover:bg-violet-200"
                : "border-orange-300 bg-orange-100 text-orange-900 hover:bg-orange-200"
            )
      )}
      disabled={isPast}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ top, height: Math.max(height, 20) }}
      type="button"
    >
      <div className="truncate font-semibold leading-tight">
        {isAvailability ? event.moderator : event.project}
      </div>
      {height >= 32 && (
        <div className="truncate text-[10px] opacity-70">
          {formatTime(event.start)} – {formatTime(event.end)}
        </div>
      )}
    </button>
  );
}
