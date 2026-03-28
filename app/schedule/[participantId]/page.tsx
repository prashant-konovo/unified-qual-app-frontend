"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Booking } from "@/lib/api/bookings";
import { bookingsApi } from "@/lib/api/bookings";
import type { InterviewSlot } from "@/lib/api/timeslots";
import { timeslotsApi } from "@/lib/api/timeslots";
import { waitingQueueApi } from "@/lib/api/waiting-queue";
import { BookingConfirmation } from "./components/booking-confirmation";
import { PreferredTimeForm } from "./components/preferred-time-form";
import { SlotPicker } from "./components/slot-picker";

type PageView = "slots" | "preferred-time" | "confirmed" | "queue-submitted";

export default function SchedulePage() {
  const { participantId } = useParams<{ participantId: string }>();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";

  const [view, setView] = useState<PageView>("slots");
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null
  );
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmittingQueue, setIsSubmittingQueue] = useState(false);

  useEffect(() => {
    setIsLoadingSlots(true);
    timeslotsApi
      .getAvailableSlots(projectId ? { projectId } : {})
      .then(setSlots)
      .catch(() => toast.error("Failed to load available slots"))
      .finally(() => setIsLoadingSlots(false));
  }, [projectId]);

  const handleConfirm = useCallback(async () => {
    if (!selectedSlotId) {
      return;
    }
    setIsConfirming(true);
    try {
      // Use URL projectId if present, otherwise fall back to the slot's own projectId
      const selectedSlot = slots.find((s) => s.id === selectedSlotId);
      const resolvedProjectId = projectId || selectedSlot?.projectId || "";
      const booking = await bookingsApi.createBooking({
        slotId: selectedSlotId,
        userId: participantId,
        projectId: resolvedProjectId,
      });
      setConfirmedBooking(booking);
      setView("confirmed");
    } catch {
      toast.error("Failed to book slot. It may have already been taken.");
    } finally {
      setIsConfirming(false);
    }
  }, [selectedSlotId, participantId, projectId, slots]);

  const handleQueueSubmit = useCallback(
    async (values: {
      preferredDays: string[];
      preferredEnd: string;
      preferredStart: string;
      timezone: string;
    }) => {
      setIsSubmittingQueue(true);
      try {
        await waitingQueueApi.addToQueue({
          userId: participantId,
          projectId,
          ...values,
        });
        setView("queue-submitted");
      } catch {
        toast.error("Failed to submit your availability. Please try again.");
      } finally {
        setIsSubmittingQueue(false);
      }
    },
    [participantId, projectId]
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Image
            alt="Konovo logo"
            className="h-8 w-8 object-contain"
            height={32}
            src="/logo.png"
            width={32}
          />
          <span className="font-semibold text-sm">Konovo</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        {view === "slots" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-bold text-2xl tracking-tight">
                Pick an interview time
              </h1>
              <p className="mt-1 text-muted-foreground text-sm">
                Choose a time that works best for you. All times are shown in
                your local timezone.
              </p>
            </div>

            <Separator />

            {isLoadingSlots ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <SlotPicker
                onNoneWork={() => setView("preferred-time")}
                onSelect={(slot) => setSelectedSlotId(slot.id)}
                selectedSlotId={selectedSlotId}
                slots={slots}
              />
            )}

            {selectedSlotId && (
              <div className="flex justify-end border-t pt-4">
                <Button disabled={isConfirming} onClick={handleConfirm}>
                  {isConfirming && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm This Time
                </Button>
              </div>
            )}
          </div>
        )}

        {view === "preferred-time" && (
          <PreferredTimeForm
            isSubmitting={isSubmittingQueue}
            onBack={() => setView("slots")}
            onSubmit={handleQueueSubmit}
          />
        )}

        {view === "confirmed" && confirmedBooking && (
          <BookingConfirmation
            booking={confirmedBooking}
            onDone={() => setView("slots")}
          />
        )}

        {view === "queue-submitted" && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
              <Loader2 className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="font-bold text-2xl">You're on the list!</h2>
            <p className="max-w-sm text-muted-foreground text-sm">
              We've recorded your preferred availability. You'll receive an
              email when a matching slot becomes available.
            </p>
            <Button onClick={() => setView("slots")} variant="outline">
              Back to Slots
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
