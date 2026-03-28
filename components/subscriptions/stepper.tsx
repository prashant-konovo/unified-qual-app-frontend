"use client";

import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  steps: {
    title: string;
    description?: string;
  }[];
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex w-full items-center">
      {steps.map((step, index) => {
        const isCompleted = currentStep > index;
        const isCurrent = currentStep === index;

        return (
          <React.Fragment key={step.title}>
            <div className="relative flex w-12 flex-shrink-0 flex-col items-center">
              <div
                className={cn(
                  "z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background transition-colors",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary",
                  !(isCompleted || isCurrent) &&
                    "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span
                    className={cn(
                      "font-medium text-sm",
                      isCurrent && "text-primary"
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "absolute top-10 w-max text-center font-medium text-xs transition-colors",
                  isCompleted || isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-[2px] flex-1 transition-colors",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
