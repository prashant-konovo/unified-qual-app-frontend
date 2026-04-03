"use client";

import { Controller } from "react-hook-form";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import type { TimelineSettingsStepProps } from "./types";

export function TimelineSettingsStep({
  register,
  control,
  errors,
}: TimelineSettingsStepProps) {
  return (
    <div className="slide-in-from-left-4 fade-in animate-in duration-300">
      <CardHeader>
        <CardTitle className="text-xl">Timeline & Settings</CardTitle>
        <CardDescription>
          Configure project dates and technical preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-3">
          <Label className="font-semibold text-base">
            1. Recruitment Completion Date
          </Label>
          <p className="mb-3 text-muted-foreground text-sm">
            When should all participants be scheduled by?
          </p>
          <Input
            className="w-full sm:w-[280px]"
            type="date"
            {...register("recruitmentDate")}
          />
          {errors.recruitmentDate && (
            <p className="text-red-500 text-sm">
              {errors.recruitmentDate.message}
            </p>
          )}
        </div>

        <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />

        <div className="space-y-3">
          <Label className="font-semibold text-base">2. Stimulus Sharing</Label>
          <p className="mb-4 text-muted-foreground text-sm">
            Determine if you need advanced screen sharing capabilities.
          </p>

          <div className="flex flex-row items-center justify-between rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Stimulus Sharing</Label>
              <p className="text-muted-foreground text-sm">
                Participants will receive a secure screen sharing link.
              </p>
            </div>
            <Controller
              control={control}
              name="enableStimulusSharing"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />

        <div className="space-y-4">
          <Label className="font-semibold text-base">3. Transcription</Label>
          <p className="mb-2 text-muted-foreground text-sm">
            Select how interview audio should be handled.
          </p>

          <Controller
            control={control}
            name="transcription"
            render={({ field }) => (
              <RadioGroup
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                defaultValue={field.value}
                onValueChange={field.onChange}
              >
                <Label className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                  <RadioGroupItem className="sr-only" value="transcribe" />
                  <div className="flex w-full items-center gap-3">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary">
                      {field.value === "transcribe" && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        Transcribe Interviews
                      </span>
                      <span className="font-normal text-muted-foreground text-xs">
                        AI will automatically transcribe the sessions.
                      </span>
                    </div>
                  </div>
                </Label>

                <Label className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                  <RadioGroupItem
                    className="sr-only"
                    value="do-not-transcribe"
                  />
                  <div className="flex w-full items-center gap-3">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary">
                      {field.value === "do-not-transcribe" && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        Do Not Transcribe
                      </span>
                      <span className="font-normal text-muted-foreground text-xs">
                        Audio will not be stored or processed.
                      </span>
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            )}
          />
        </div>
      </CardContent>
    </div>
  );
}
