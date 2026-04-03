"use client";

import { UseFormReturn } from "react-hook-form";

import { SubscriptionFormValues } from "../types";

export interface ReviewStepProps {
  form: UseFormReturn<SubscriptionFormValues>;
}

export function ReviewStep({ form }: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <h4 className="px-2 font-semibold">Summary</h4>
      <div className="space-y-3 rounded-md bg-muted/50 p-4 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <span className="text-muted-foreground">Company:</span>
          <span className="font-medium">
            {form.getValues("company")} ({form.getValues("shortCode")}
            )
          </span>

          <span className="text-muted-foreground">Plan:</span>
          <span className="font-medium capitalize">
            {form.getValues("plan") || "None"}
          </span>

          <span className="text-muted-foreground">Salesforce:</span>
          <span className="font-medium">
            {form.getValues("salesforceAccount")}
          </span>

          <span className="text-muted-foreground">Service Type:</span>
          <span className="font-medium capitalize">
            {form.getValues("serviceType")} -{" "}
            {form.getValues("businessType")}
          </span>
        </div>
      </div>
    </div>
  );
}
