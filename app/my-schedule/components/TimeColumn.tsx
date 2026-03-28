"use client";

import { cn } from "@/lib/utils";

// Calendar starts at 6 AM, ends at 10 PM = 16 hours × 4 slots/hr = 64 slots
// Each slot = 16px tall  →  1 hour = 64px
const START_HOUR = 0;
const END_HOUR = 24;

export function TimeColumn() {
  const slots: { label: string; showLabel: boolean }[] = [];

  for (let h = START_HOUR; h < END_HOUR; h++) {
    for (let m = 0; m < 60; m += 15) {
      const isPrimary = m === 0;
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      const minuteStr = m === 0 ? "" : `:${String(m).padStart(2, "0")}`;
      slots.push({
        label: isPrimary ? `${hour12}${minuteStr} ${ampm}` : "",
        showLabel: isPrimary,
      });
    }
  }

  return (
    <div className="sticky left-0 z-20 w-16 shrink-0 select-none border-border border-r bg-background">
      {slots.map((slot, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static list
          className={cn(
            "flex h-4 items-start justify-end pr-2",
            slot.showLabel ? "border-border border-t" : ""
          )}
          key={i}
        >
          {slot.showLabel && (
            <span className="mt-1.5 whitespace-nowrap text-[10px] text-muted-foreground leading-none">
              {slot.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export { START_HOUR, END_HOUR };
