"use client";

import {
  CalendarDays,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  UserCircle2,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { ParticipantDetail } from "@/lib/api/participants";
import { participantsApi } from "@/lib/api/participants";

function formatDateTime(dateStr?: string) {
  if (!dateStr) {
    return "—";
  }
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(dateStr?: string) {
  if (!dateStr) {
    return "—";
  }
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function surveyBadgeClass(status: string) {
  if (status === "qualified") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";
  }
  if (status === "disqualified") {
    return "border-red-300 bg-red-50 text-red-700";
  }
  return "border-zinc-300 bg-zinc-100 text-zinc-600";
}

function bookingBadgeClass(status: string) {
  if (status === "scheduled") {
    return "border-blue-300 bg-blue-50 text-blue-700";
  }
  if (status === "completed") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";
  }
  return "border-zinc-300 bg-zinc-100 text-zinc-600";
}

export default function ParticipantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [participant, setParticipant] = useState<ParticipantDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    participantsApi
      .getParticipant(id)
      .then(setParticipant)
      .catch(() => toast.error("Failed to load participant"))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-50/50 dark:bg-zinc-950/20">
        <h2 className="font-semibold text-xl">Participant not found</h2>
        <Button asChild>
          <Link href="/participants">Back to Participants</Link>
        </Button>
      </div>
    );
  }

  const { surveyResponse, booking, waitingEntry } = participant;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator className="mr-2 h-4" orientation="vertical" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/participants">Participants</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold">
                {participant.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 bg-zinc-50/50 p-4 md:p-8 dark:bg-zinc-950/20">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Title bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-bold text-2xl tracking-tight">
                  {participant.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      participant.status === "active"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                        : "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    }
                    variant="outline"
                  >
                    {participant.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="secondary">Participant</Badge>
                </div>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link
                href={`/schedule/${participant.id}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Slot Picker
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-medium text-sm">{participant.email}</p>
                  </div>
                </div>
                {participant.phone && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground text-xs">Phone</p>
                      <p className="font-medium text-sm">{participant.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Joined</p>
                    <p className="font-medium text-sm">
                      {formatDate(participant.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Survey Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Survey Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                {surveyResponse ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Status
                      </span>
                      <Badge
                        className={surveyBadgeClass(surveyResponse.status)}
                        variant="outline"
                      >
                        {surveyResponse.status.charAt(0).toUpperCase() +
                          surveyResponse.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Submitted
                      </span>
                      <span className="text-sm">
                        {formatDate(surveyResponse.submittedAt)}
                      </span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {Object.entries(surveyResponse.answers).map(
                        ([question, answer]) => (
                          <div key={question}>
                            <p className="font-medium text-muted-foreground text-xs">
                              {question}
                            </p>
                            <p className="text-sm">
                              {Array.isArray(answer)
                                ? answer.join(", ")
                                : answer}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No survey response yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Interview Booking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  Interview Booking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {booking ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Status
                      </span>
                      <Badge
                        className={bookingBadgeClass(booking.status)}
                        variant="outline"
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Slot</p>
                        <p className="text-sm">
                          {formatDateTime(booking.slotStart)} →{" "}
                          {formatDateTime(booking.slotEnd)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <UserCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Moderator
                        </p>
                        <p className="text-sm">{booking.moderatorName}</p>
                      </div>
                    </div>
                    {booking.meetingLink && (
                      <div className="flex items-center gap-3">
                        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Meeting Link
                          </p>
                          <a
                            className="text-primary text-sm hover:underline"
                            href={booking.meetingLink}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Join Meeting
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No interview booked yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Waiting Queue */}
            {waitingEntry && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Waiting Queue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Status
                    </span>
                    <Badge
                      className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                      variant="outline"
                    >
                      Waiting
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Preferred time
                    </span>
                    <span className="text-sm">
                      {waitingEntry.preferredStart} –{" "}
                      {waitingEntry.preferredEnd}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Preferred days
                    </span>
                    <span className="text-sm">
                      {waitingEntry.preferredDays.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Timezone
                    </span>
                    <span className="text-sm">{waitingEntry.timezone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Waiting since
                    </span>
                    <span className="text-sm">
                      {formatDate(waitingEntry.waitingSince)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
