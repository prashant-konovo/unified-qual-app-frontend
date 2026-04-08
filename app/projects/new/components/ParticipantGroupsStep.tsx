"use client";

import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ParticipantGroupsStepProps } from "./types";

export function ParticipantGroupsStep({
  register,
  control,
  errors,
  fields,
  append,
  remove,
}: ParticipantGroupsStepProps) {
  return (
    <div className="slide-in-from-left-4 fade-in animate-in duration-300">
      <CardHeader>
        <CardTitle className="text-xl">Participant Groups</CardTitle>
        <CardDescription>
          Define who you want to recruit for this research project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <Card
            className="relative border-zinc-200 bg-zinc-50/50 p-5 shadow-none dark:border-zinc-800 dark:bg-zinc-900/50"
            key={field.id}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-medium">Crowd Name</Label>
                <Input
                  placeholder="e.g. IT Managers"
                  {...register(`participantGroups.${index}.crowdName` as const)}
                />
                {errors.participantGroups?.[index]?.crowdName && (
                  <p className="text-red-500 text-xs">
                    {errors.participantGroups[index]?.crowdName?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Profession</Label>
                <Controller
                  control={control}
                  name={`participantGroups.${index}.profession` as const}
                  render={({ field }) => (
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select profession" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physician">Physician</SelectItem>
                        <SelectItem value="nurse">Nurse / NP</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist</SelectItem>
                        <SelectItem value="administrator">
                          Healthcare Administrator
                        </SelectItem>
                        <SelectItem value="specialist">
                          Specialist (HCP)
                        </SelectItem>
                        <SelectItem value="payer">
                          Payer / Managed Care
                        </SelectItem>
                        <SelectItem value="patient">
                          Patient / Caregiver
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.participantGroups?.[index]?.profession && (
                  <p className="text-red-500 text-xs">
                    {errors.participantGroups[index]?.profession?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Sample Size</Label>
                <Input
                  min="1"
                  type="number"
                  {...register(
                    `participantGroups.${index}.sampleSize` as const,
                    { valueAsNumber: true }
                  )}
                />
                {errors.participantGroups?.[index]?.sampleSize && (
                  <p className="text-red-500 text-xs">
                    {errors.participantGroups[index]?.sampleSize?.message}
                  </p>
                )}
              </div>
            </div>

            {fields.length > 1 && (
              <Button
                className="absolute -top-3 -right-3 h-6 w-6 rounded-full border bg-background p-0 text-muted-foreground hover:bg-red-100 hover:text-red-600"
                onClick={() => remove(index)}
                size="sm"
                type="button"
                variant="ghost"
              >
                &times;
              </Button>
            )}
          </Card>
        ))}

        <Button
          className="mt-2 w-full border-2 border-dashed hover:bg-zinc-50 dark:hover:bg-zinc-900"
          onClick={() =>
            append({ crowdName: "", profession: "", sampleSize: 1 })
          }
          type="button"
          variant="outline"
        >
          + Add Participant Group
        </Button>
        {errors.participantGroups?.root && (
          <p className="text-center text-red-500 text-sm">
            {errors.participantGroups.root.message}
          </p>
        )}
      </CardContent>
    </div>
  );
}
