"use client";

import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ScreeningRule, SurveyQuestion } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  questions: SurveyQuestion[];
  rules: ScreeningRule[];
  projectName: string;
  crowdName: string;
};

type ScreenStatus = "active" | "disqualified" | "completed";

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
    <div className="flex gap-2">
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

export function SurveyPreview({
  open,
  onOpenChange,
  questions,
  rules,
  projectName,
  crowdName,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | number>
  >({});
  const [status, setStatus] = useState<ScreenStatus>("active");

  const reset = () => {
    setCurrentIndex(0);
    setAnswers({});
    setStatus("active");
  };

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0
      ? Math.round((currentIndex / questions.length) * 100)
      : 0;

  function checkRules(questionId: string, answerValue: string): boolean {
    const relevantRules = rules.filter((r) => r.questionId === questionId);
    for (const rule of relevantRules) {
      let matches = false;
      const numAnswer = Number(answerValue);
      const numValue = Number(rule.value);

      switch (rule.condition) {
        case "equals":
          matches = answerValue === rule.value;
          break;
        case "not_equals":
          matches = answerValue !== rule.value;
          break;
        case "contains":
          matches = answerValue
            .toLowerCase()
            .includes(rule.value.toLowerCase());
          break;
        case "greater_than":
          matches = !Number.isNaN(numAnswer) && numAnswer > numValue;
          break;
        case "less_than":
          matches = !Number.isNaN(numAnswer) && numAnswer < numValue;
          break;
      }

      if (matches && rule.action === "disqualify") {
        return false;
      }
    }
    return true;
  }

  const handleNext = () => {
    if (!currentQuestion) {
      return;
    }
    const answer = answers[currentQuestion.id];
    const answerStr = Array.isArray(answer)
      ? (answer[0] ?? "")
      : String(answer ?? "");

    const qualified = checkRules(currentQuestion.id, answerStr);
    if (!qualified) {
      setStatus("disqualified");
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setStatus("completed");
    }
  };

  const handleToggleMultiple = (questionId: string, option: string) => {
    const prev = (answers[questionId] as string[]) ?? [];
    const next = prev.includes(option)
      ? prev.filter((o) => o !== option)
      : [...prev, option];
    setAnswers({ ...answers, [questionId]: next });
  };

  return (
    <Dialog
      onOpenChange={(v) => {
        if (!v) {
          reset();
        }
        onOpenChange(v);
      }}
      open={open}
    >
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Survey Preview</DialogTitle>
        </DialogHeader>

        {/* Survey top bar */}
        <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-6 py-3">
          <div>
            <p className="font-semibold text-foreground text-xs">
              {projectName}
            </p>
            <p className="text-[10px] text-muted-foreground">{crowdName}</p>
          </div>
          <Badge className="text-[10px]" variant="outline">
            Preview Mode
          </Badge>
        </div>

        {/* Progress bar */}
        {status === "active" && questions.length > 0 && (
          <div className="shrink-0 px-6 pt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-[10px] text-muted-foreground">
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
        )}

        {/* Body */}
        <div className="min-h-[300px] px-6 py-6">
          {/* Disqualified screen */}
          {status === "disqualified" && (
            <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                <XCircleIcon className="h-8 w-8 text-rose-500" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">
                  Thank you for your time
                </p>
                <p className="mt-1 max-w-xs text-muted-foreground text-sm">
                  Based on your responses, unfortunately you don't qualify for
                  this study.
                </p>
              </div>
              <Button
                className="text-xs"
                onClick={reset}
                size="sm"
                variant="outline"
              >
                Restart Preview
              </Button>
            </div>
          )}

          {/* Completed screen */}
          {status === "completed" && (
            <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2Icon className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">
                  You've qualified!
                </p>
                <p className="mt-1 max-w-xs text-muted-foreground text-sm">
                  Thank you for completing the screening survey. We'll be in
                  touch shortly.
                </p>
              </div>
              <Button
                className="text-xs"
                onClick={reset}
                size="sm"
                variant="outline"
              >
                Restart Preview
              </Button>
            </div>
          )}

          {/* Active question */}
          {status === "active" && currentQuestion && (
            <div className="space-y-5">
              <div>
                <p className="mb-1 font-semibold text-[11px] text-primary uppercase tracking-wide">
                  Question {currentIndex + 1}
                </p>
                <h2 className="font-bold text-foreground text-xl leading-snug">
                  {currentQuestion.question || "Untitled question"}
                  {currentQuestion.required && (
                    <span className="ml-1 text-rose-500">*</span>
                  )}
                </h2>
                {currentQuestion.description && (
                  <p className="mt-1.5 text-muted-foreground text-sm">
                    {currentQuestion.description}
                  </p>
                )}
              </div>

              {/* Input by type */}
              {currentQuestion.type === "short_text" && (
                <Input
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: e.target.value,
                    })
                  }
                  placeholder="Your answer…"
                  value={(answers[currentQuestion.id] as string) ?? ""}
                />
              )}

              {currentQuestion.type === "long_text" && (
                <Textarea
                  className="min-h-[100px] resize-none"
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: e.target.value,
                    })
                  }
                  placeholder="Your answer…"
                  value={(answers[currentQuestion.id] as string) ?? ""}
                />
              )}

              {currentQuestion.type === "number" && (
                <Input
                  className="max-w-[200px]"
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: e.target.value,
                    })
                  }
                  placeholder="Enter a number…"
                  type="number"
                  value={(answers[currentQuestion.id] as string) ?? ""}
                />
              )}

              {currentQuestion.type === "single_choice" && (
                <div className="space-y-2">
                  {(currentQuestion.options ?? []).map((opt) => (
                    <button
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                        answers[currentQuestion.id] === opt
                          ? "border-primary bg-primary/10 font-medium text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                      key={opt}
                      onClick={() =>
                        setAnswers({ ...answers, [currentQuestion.id]: opt })
                      }
                      type="button"
                    >
                      <span
                        className={cn(
                          "h-4 w-4 shrink-0 rounded-full border-2 transition-colors",
                          answers[currentQuestion.id] === opt
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40"
                        )}
                      />
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === "multiple_choice" && (
                <div className="space-y-2">
                  {(currentQuestion.options ?? []).map((opt) => {
                    const selected = (
                      (answers[currentQuestion.id] as string[]) ?? []
                    ).includes(opt);
                    return (
                      <button
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                          selected
                            ? "border-primary bg-primary/10 font-medium text-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                        key={opt}
                        onClick={() =>
                          handleToggleMultiple(currentQuestion.id, opt)
                        }
                        type="button"
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                            selected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/40"
                          )}
                        >
                          {selected && (
                            <svg
                              className="h-2.5 w-2.5 fill-white"
                              viewBox="0 0 10 8"
                            >
                              <path
                                d="M1 4l3 3 5-6"
                                fill="none"
                                stroke="white"
                                strokeLinecap="round"
                                strokeWidth="1.5"
                              />
                            </svg>
                          )}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "dropdown" && (
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: e.target.value,
                    })
                  }
                  value={(answers[currentQuestion.id] as string) ?? ""}
                >
                  <option value="">Select an option…</option>
                  {(currentQuestion.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {currentQuestion.type === "rating" && (
                <RatingInput
                  max={currentQuestion.ratingMax ?? 5}
                  onChange={(v) =>
                    setAnswers({ ...answers, [currentQuestion.id]: v })
                  }
                  value={(answers[currentQuestion.id] as number) ?? null}
                />
              )}
            </div>
          )}
        </div>

        {/* Navigation footer */}
        {status === "active" && (
          <div className="flex shrink-0 items-center justify-between border-t bg-muted/20 px-6 py-4">
            <Button
              className="gap-1.5"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              size="sm"
              variant="outline"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
              Back
            </Button>
            <Button
              className="min-w-[90px] gap-1.5"
              onClick={handleNext}
              size="sm"
            >
              {currentIndex < questions.length - 1 ? "Next" : "Submit"}
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
