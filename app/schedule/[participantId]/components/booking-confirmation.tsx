"use client";

import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Booking } from "@/lib/api/bookings";

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface BookingConfirmationProps {
  booking: Booking;
  onDone: () => void;
}

export function BookingConfirmation({
  booking,
  onDone,
}: BookingConfirmationProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <CheckCircle2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="font-bold text-2xl tracking-tight">You're booked!</h2>
        <p className="max-w-sm text-muted-foreground text-sm">
          Your interview has been scheduled. You'll receive a confirmation email
          shortly.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Status</span>
            <Badge
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
              variant="outline"
            >
              Confirmed
            </Badge>
          </div>
          <Separator />
          <div>
            <p className="text-muted-foreground text-xs">Date &amp; Time</p>
            <p className="mt-0.5 font-medium text-sm">
              {formatDateTime(booking.slotStart)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Moderator</p>
            <p className="mt-0.5 font-medium text-sm">
              {booking.moderatorName}
            </p>
          </div>
          {booking.meetingLink && (
            <div>
              <p className="text-muted-foreground text-xs">Meeting Link</p>
              <a
                className="mt-0.5 text-primary text-sm hover:underline"
                href={booking.meetingLink}
                rel="noopener noreferrer"
                target="_blank"
              >
                Join Meeting
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={onDone} variant="outline">
        Done
      </Button>
    </div>
  );
}
