"use client";

import { Loader2 } from "lucide-react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SurveyBuilderStep } from "../SurveyBuilderStep";
import type { SurveyStepProps } from "./types";

export function SurveyStep({
  surveyMode,
  setSurveyMode,
  surveyQuestions,
  setSurveyQuestions,
  surveyRules,
  setSurveyRules,
  linkedSurveyId,
  setLinkedSurveyId,
  availableSurveys,
  isLoadingSurveys,
}: SurveyStepProps) {
  return (
    <div className="slide-in-from-left-4 fade-in animate-in duration-300">
      <CardHeader>
        <CardTitle className="text-xl">Screening Survey</CardTitle>
        <CardDescription>
          Create a screening survey for participants or attach an existing
          published one. This is optional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          className="flex flex-col gap-4 sm:flex-row"
          onValueChange={(val) => setSurveyMode(val as "create" | "attach")}
          value={surveyMode}
        >
          <Label className="flex flex-1 cursor-pointer items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
            <RadioGroupItem className="sr-only" value="create" />
            <div className="flex items-center gap-3">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary">
                {surveyMode === "create" && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </span>
              <span className="font-semibold text-sm">Build New Survey</span>
            </div>
          </Label>

          <Label className="flex flex-1 cursor-pointer items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
            <RadioGroupItem className="sr-only" value="attach" />
            <div className="flex items-center gap-3">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary">
                {surveyMode === "attach" && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </span>
              <span className="font-semibold text-sm">Attach Existing</span>
            </div>
          </Label>
        </RadioGroup>

        {surveyMode === "create" ? (
          <div className="mt-4 border-t pt-4">
            <SurveyBuilderStep
              onQuestionsChange={setSurveyQuestions}
              onRulesChange={setSurveyRules}
              questions={surveyQuestions}
              rules={surveyRules}
            />
          </div>
        ) : (
          <div className="mt-4 space-y-3 border-t pt-4">
            <Label>Select Published Survey</Label>
            {isLoadingSurveys ? (
              <div className="flex items-center text-muted-foreground text-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching
                surveys...
              </div>
            ) : availableSurveys.length > 0 ? (
              <Select onValueChange={setLinkedSurveyId} value={linkedSurveyId}>
                <SelectTrigger className="w-full sm:max-w-md">
                  <SelectValue placeholder="Select a survey" />
                </SelectTrigger>
                <SelectContent>
                  {availableSurveys.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.projectName || "Untitled"} ({s.questions?.length || 0}{" "}
                      questions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="rounded-md border bg-muted/50 p-4 text-muted-foreground text-sm">
                No published surveys found. Switch to "Build New Survey" to
                create one.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </div>
  );
}
