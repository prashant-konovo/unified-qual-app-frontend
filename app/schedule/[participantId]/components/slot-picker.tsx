"use client";

import { CalendarX2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InterviewSlot } from "@/lib/api/timeslots";

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function groupByDay(slots: InterviewSlot[]): Map<string, InterviewSlot[]> {
  // Sort chronologically first so days and times appear in order
  const sorted = [...slots].sort((a, b) => a.start.localeCompare(b.start));

  const map = new Map<string, InterviewSlot[]>();
  const seenTimes = new Set<string>();

  for (const slot of sorted) {
    // Deduplicate by start time — multiple moderators available at the
    // same time show as one option; the first (arbitrary) slot is booked.
    if (seenTimes.has(slot.start)) {
      continue;
    }
    seenTimes.add(slot.start);

    const day = slot.start.slice(0, 10);
    const existing = map.get(day);
    if (existing) {
      existing.push(slot);
    } else {
      map.set(day, [slot]);
    }
  }
  return map;
}

interface SlotPickerProps {
  onNoneWork: () => void;
  onSelect: (slot: InterviewSlot) => void;
  selectedSlotId?: string;
  slots: InterviewSlot[];
}

export function SlotPicker({
  slots,
  selectedSlotId,
  onSelect,
  onNoneWork,
}: SlotPickerProps) {
  const grouped = groupByDay(slots);

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CalendarX2 className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="font-medium">No slots available right now</p>
          <p className="mt-1 text-muted-foreground text-sm">
            Let us know when you're free and we'll find a time that works.
          </p>
        </div>
        <Button onClick={onNoneWork} variant="outline">
          Tell us your availability
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([day, daySlots]) => (
        <div key={day}>
          <h3 className="mb-3 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            {formatDay(daySlots[0].start)}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {daySlots.map((slot) => {
              const isSelected = slot.id === selectedSlotId;
              return (
                <button
                  className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                  }`}
                  key={slot.id}
                  onClick={() => onSelect(slot)}
                  type="button"
                >
                  <span className="font-medium text-sm">
                    {formatTime(slot.start)} – {formatTime(slot.end)}
                  </span>
                  {isSelected && (
                    <Badge
                      className="border-primary/20 bg-primary/10 text-primary text-xs"
                      variant="outline"
                    >
                      Selected
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-t pt-4">
        <Button onClick={onNoneWork} variant="ghost">
          None of these times work →
        </Button>
      </div>
    </div>
  );
}
