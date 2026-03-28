"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BookingConfirmation } from "@/app/schedule/[participantId]/components/booking-confirmation";
import { SlotPicker } from "@/app/schedule/[participantId]/components/slot-picker";
import type { ScreeningRule, SurveyQuestion } from "@/app/survey-builder/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Booking } from "@/lib/api/bookings";
import { bookingsApi } from "@/lib/api/bookings";
import type { PublicSurvey } from "@/lib/api/survey-responses";
import { surveyResponsesApi } from "@/lib/api/survey-responses";
import type { InterviewSlot } from "@/lib/api/timeslots";
import { timeslotsApi } from "@/lib/api/timeslots";
import { cn } from "@/lib/utils";

type PageView =
  | "loading"
  | "survey"
  | "submitting"
  | "disqualified"
  | "slots"
  | "confirming"
  | "booked"
  | "error";

type Answers = Record<string, string | string[] | number>;

function checkRules(
  rules: ScreeningRule[],
  questionId: string,
  answerValue: string
): boolean {
  for (const rule of rules) {
    if (rule.questionId !== questionId) {
      continue;
    }
    const numAnswer = Number(answerValue);
    const numValue = Number(rule.value);
    let matches = false;

    if (rule.condition === "equals") {
      matches = answerValue === rule.value;
    } else if (rule.condition === "not_equals") {
      matches = answerValue !== rule.value;
    } else if (rule.condition === "contains") {
      matches = answerValue.toLowerCase().includes(rule.value.toLowerCase());
    } else if (rule.condition === "greater_than") {
      matches = !Number.isNaN(numAnswer) && numAnswer > numValue;
    } else if (rule.condition === "less_than") {
      matches = !Number.isNaN(numAnswer) && numAnswer < numValue;
    }

    if (matches && rule.action === "disqualify") {
      return false;
    }
  }
  return true;
}

function RatingInput({
  max,
  value,
  onChange,
}: {
  max: number;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          className={cn(
            "h-10 w-10 rounded-lg border font-medium text-sm transition-all",
            value === n
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-background hover:border-primary/60 hover:bg-primary/5"
          )}
          key={n}
          onClick={() => onChange(n)}
          type="button"
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function QuestionStep({
  question,
  answer,
  onAnswer,
}: {
  question: SurveyQuestion;
  answer: string | string[] | number | undefined;
  onAnswer: (v: string | string[] | number) => void;
}) {
  const handleToggleMultiple = (option: string) => {
    const prev = (answer as string[]) ?? [];
    const next = prev.includes(option)
      ? prev.filter((o) => o !== option)
      : [...prev, option];
    onAnswer(next);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-foreground text-xl leading-snug">
          {question.question}
          {question.required && <span className="ml-1 text-rose-500">*</span>}
        </h2>
        {question.description && (
          <p className="mt-1.5 text-muted-foreground text-sm">
            {question.description}
          </p>
        )}
      </div>

      {question.type === "short_text" && (
        <Input
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Your answer…"
          value={(answer as string) ?? ""}
        />
      )}

      {question.type === "long_text" && (
        <Textarea
          className="min-h-[120px]"
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Your answer…"
          value={(answer as string) ?? ""}
        />
      )}

      {question.type === "number" && (
        <Input
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Enter a number…"
          type="number"
          value={(answer as string) ?? ""}
        />
      )}

      {question.type === "rating" && (
        <RatingInput
          max={question.ratingMax ?? 5}
          onChange={onAnswer}
          value={typeof answer === "number" ? answer : null}
        />
      )}

      {(question.type === "single_choice" || question.type === "dropdown") &&
        question.options?.map((opt) => (
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
              answer === opt
                ? "border-primary bg-primary/5 font-medium text-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/40"
            )}
            key={opt}
            onClick={() => onAnswer(opt)}
            type="button"
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                answer === opt
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              )}
            >
              {answer === opt && (
                <span className="h-2 w-2 rounded-full bg-white" />
              )}
            </span>
            {opt}
          </button>
        ))}

      {question.type === "multiple_choice" &&
        question.options?.map((opt) => {
          const selected = ((answer as string[]) ?? []).includes(opt);
          return (
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                selected
                  ? "border-primary bg-primary/5 font-medium text-primary"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              )}
              key={opt}
              onClick={() => handleToggleMultiple(opt)}
              type="button"
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-md border",
                  selected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                )}
              >
                {selected && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <title>checked</title>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              {opt}
            </button>
          );
        })}
    </div>
  );
}

export default function ParticipantSurveyPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const searchParams = useSearchParams();
  const participantId = searchParams.get("userId") ?? "";
  const projectIdParam = searchParams.get("projectId") ?? "";

  const [survey, setSurvey] = useState<PublicSurvey | null>(null);
  const [view, setView] = useState<PageView>("loading");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null
  );

  const totalQuestions = survey?.questions.length ?? 0;
  const currentQuestion = survey?.questions[currentIndex] ?? null;
  const progress = Math.round(
    (currentIndex / Math.max(1, totalQuestions)) * 100
  );

  const loadSlots = useCallback((projectId: string) => {
    setSlotsLoading(true);
    timeslotsApi
      .getAvailableSlots(projectId ? { projectId } : {})
      .then(setSlots)
      .catch(() => toast.error("Failed to load available slots"))
      .finally(() => setSlotsLoading(false));
  }, []);

  useEffect(() => {
    surveyResponsesApi
      .getPublicSurvey(surveyId)
      .then(async (s) => {
        setSurvey(s);

        // Check if this participant has already submitted a response.
        if (participantId) {
          const existing = await surveyResponsesApi.getExistingResponse(
            participantId,
            projectIdParam || s.projectId
          );
          if (existing) {
            if (existing.status === "disqualified") {
              setView("disqualified");
            } else {
              // Already qualified — go straight to slot selection.
              setView("slots");
              loadSlots(projectIdParam || s.projectId);
            }
            return;
          }
        }

        setView("survey");
      })
      .catch(() => setView("error"));
  }, [surveyId, participantId, projectIdParam, loadSlots]);

  const handleNext = useCallback(async () => {
    if (!(currentQuestion && survey)) {
      return;
    }

    const answer = answers[currentQuestion.id];
    const answerStr = Array.isArray(answer)
      ? (answer[0] ?? "")
      : String(answer ?? "");

    const qualified = checkRules(survey.rules, currentQuestion.id, answerStr);
    if (!qualified) {
      setView("disqualified");
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    setView("submitting");
    try {
      const result = await surveyResponsesApi.submitResponse({
        userId: participantId,
        projectId: projectIdParam || survey.projectId,
        surveyId: survey.id,
        answers,
      });

      if (result.status === "disqualified") {
        setView("disqualified");
        return;
      }

      setView("slots");
      loadSlots(projectIdParam || survey.projectId);
    } catch {
      toast.error("Failed to submit your responses. Please try again.");
      setView("survey");
    }
  }, [
    currentQuestion,
    survey,
    answers,
    currentIndex,
    totalQuestions,
    participantId,
    projectIdParam,
    loadSlots,
  ]);

  const handleConfirmSlot = useCallback(async () => {
    if (!(selectedSlotId && survey)) {
      return;
    }
    setView("confirming");
    try {
      const selectedSlot = slots.find((s) => s.id === selectedSlotId);
      const resolvedProjectId =
        projectIdParam || survey.projectId || selectedSlot?.projectId || "";
      const booking = await bookingsApi.createBooking({
        slotId: selectedSlotId,
        userId: participantId,
        projectId: resolvedProjectId,
      });
      setConfirmedBooking(booking);
      setView("booked");
    } catch {
      toast.error("Failed to book slot. It may have already been taken.");
      setView("slots");
    }
  }, [selectedSlotId, slots, participantId, projectIdParam, survey]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
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
        {view === "loading" && (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {view === "error" && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <XCircle className="h-12 w-12 text-rose-500" />
            <p className="font-semibold text-lg">Survey not found</p>
            <p className="text-muted-foreground text-sm">
              This survey link may be invalid or the survey may no longer be
              active.
            </p>
          </div>
        )}

        {(view === "survey" || view === "submitting") &&
          survey &&
          currentQuestion && (
            <div className="space-y-8">
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  {survey.projectName}
                </p>
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      Question {currentIndex + 1} of {totalQuestions}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <QuestionStep
                answer={answers[currentQuestion.id]}
                onAnswer={(v) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: v,
                  }))
                }
                question={currentQuestion}
              />

              <div className="flex items-center justify-between pt-2">
                {currentIndex > 0 ? (
                  <Button
                    onClick={() => setCurrentIndex((i) => i - 1)}
                    size="sm"
                    variant="ghost"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  disabled={
                    view === "submitting" ||
                    Boolean(
                      currentQuestion.required && !answers[currentQuestion.id]
                    )
                  }
                  onClick={handleNext}
                  size="sm"
                >
                  {view === "submitting" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {currentIndex < totalQuestions - 1 ? (
                    <>
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </div>
          )}

        {view === "disqualified" && (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
              <XCircle className="h-9 w-9 text-rose-500" />
            </div>
            <div>
              <h2 className="font-bold text-2xl tracking-tight">
                Thank you for your time
              </h2>
              <p className="mt-2 max-w-sm text-muted-foreground text-sm">
                Based on your responses, you don&apos;t qualify for this study
                at this time.
              </p>
            </div>
          </div>
        )}

        {(view === "slots" || view === "confirming") && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="font-bold text-2xl tracking-tight">
                You&apos;ve qualified!
              </h1>
              <p className="text-muted-foreground text-sm">
                Pick an interview time that works for you.
              </p>
            </div>

            {slotsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <SlotPicker
                  onNoneWork={() =>
                    toast.info("Please check back later for available slots.")
                  }
                  onSelect={(slot) => setSelectedSlotId(slot.id)}
                  selectedSlotId={selectedSlotId}
                  slots={slots}
                />
                {selectedSlotId && (
                  <div className="flex justify-center pt-2">
                    <Button
                      disabled={view === "confirming"}
                      onClick={handleConfirmSlot}
                      size="lg"
                    >
                      {view === "confirming" && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Confirm this time
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === "booked" && confirmedBooking && (
          <BookingConfirmation
            booking={confirmedBooking}
            onDone={() => undefined}
          />
        )}
      </main>
    </div>
  );
}
