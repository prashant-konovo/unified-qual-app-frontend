"use client";

import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { CrowdFormValues } from "../types";

export interface AttributesStepProps {
  form: UseFormReturn<CrowdFormValues>;
  fieldArray: UseFieldArrayReturn<CrowdFormValues, "attributes", "id">;
}

export function AttributesStep({ form, fieldArray }: AttributesStepProps) {
  const { fields, append, remove } = fieldArray;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h4 className="font-medium text-sm">
            Targeting Attributes
          </h4>
          <p className="text-muted-foreground text-sm">
            Add dynamic screening constraints
          </p>
        </div>
        <Button
          onClick={() => append({ name: "", choices: "" })}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Attribute
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-8 text-center">
          <p className="text-muted-foreground text-sm">
            No target attributes configured.
          </p>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {fields.map((field, index) => (
          <div
            className="fade-in slide-in-from-top-2 flex animate-in items-start gap-3 rounded-lg border bg-card p-3 shadow-sm"
            key={field.id}
          >
            <FormField
              control={form.control}
              name={`attributes.${index}.name`}
              render={({ field }) => (
                <FormItem className="flex-1 space-y-1">
                  <FormLabel className="font-semibold text-xs">
                    Attribute
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-9"
                      placeholder="e.g. Budget Authority"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`attributes.${index}.choices`}
              render={({ field }) => (
                <FormItem className="flex-[2] space-y-1">
                  <FormLabel className="font-semibold text-xs">
                    Criteria/Choices (comma separated)
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-9"
                      placeholder="e.g. Yes, Approver Only"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <Button
              className="mt-6 h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => remove(index)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
