"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewStepProps } from "./types";

export function ReviewStep({
  register,
  surveyQuestions,
  surveyRules,
}: ReviewStepProps) {
  return (
    <div className="slide-in-from-left-4 fade-in animate-in duration-300">
      <CardHeader>
        <CardTitle className="text-xl">Additional Notes & Review</CardTitle>
        <CardDescription>
          Finalize your configuration before publishing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="font-semibold text-foreground" htmlFor="notes">
            Other Notes
          </Label>
          <Textarea
            className="min-h-[120px] resize-y"
            id="notes"
            placeholder="Add any additional instructions for recruiters or stakeholders here..."
            {...register("notes")}
          />
          <p className="text-muted-foreground text-sm">
            Optional internal notes for the project.
          </p>
        </div>

        {/* Survey summary */}
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h4 className="font-semibold text-foreground text-sm">
            Screening Survey
          </h4>
          {surveyQuestions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No survey questions added — participants will not be screened.
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                <span className="font-medium text-foreground">
                  {surveyQuestions.length}
                </span>{" "}
                question{surveyQuestions.length !== 1 ? "s" : ""} added
                {surveyRules.length > 0 && (
                  <>
                    ,{" "}
                    <span className="font-medium text-foreground">
                      {surveyRules.length}
                    </span>{" "}
                    screening rule
                    {surveyRules.length !== 1 ? "s" : ""} configured
                  </>
                )}
                .
              </p>
              <ul className="mt-2 list-disc space-y-0.5 pl-4 text-muted-foreground text-xs">
                {surveyQuestions.slice(0, 5).map((q, i) => (
                  <li key={q.id}>
                    {q.question || `Question ${i + 1} (untitled)`}
                  </li>
                ))}
                {surveyQuestions.length > 5 && (
                  <li className="text-muted-foreground/70">
                    …and {surveyQuestions.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h4 className="font-semibold text-foreground text-sm">
            Review Requirements
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-sm">
            <li>
              Ensure participant sample sizes accurately match your budget.
            </li>
            <li>Double check recruitment deadlines.</li>
            <li>Check if Salesforce billing details correctly map.</li>
          </ul>
        </div>
      </CardContent>
    </div>
  );
}
