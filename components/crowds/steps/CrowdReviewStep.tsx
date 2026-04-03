"use client";

import { UseFormReturn } from "react-hook-form";

import { CrowdFormValues } from "../types";

export interface CrowdReviewStepProps {
  form: UseFormReturn<CrowdFormValues>;
}

export function CrowdReviewStep({ form }: CrowdReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border bg-muted/10 p-5">
        <h4 className="border-b pb-2 font-semibold text-sm">
          Basic Info
        </h4>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="mb-1 block text-muted-foreground text-xs uppercase tracking-wider">
              Name
            </span>
            <span className="font-medium">
              {form.getValues("name") || "—"}
            </span>
          </div>
          <div>
            <span className="mb-1 block text-muted-foreground text-xs uppercase tracking-wider">
              Subscription
            </span>
            <span className="font-medium capitalize">
              {form.getValues("subscription") || "—"}
            </span>
          </div>
          <div>
            <span className="mb-1 block text-muted-foreground text-xs uppercase tracking-wider">
              Type
            </span>
            <span className="font-medium">
              {form.getValues("type")}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-muted/10 p-5">
        <h4 className="border-b pb-2 font-semibold text-sm">
          Targeting Filters
        </h4>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="mb-1 block text-muted-foreground text-xs uppercase tracking-wider">
              Country
            </span>
            <span className="font-medium capitalize">
              {form.getValues("country") || "—"}
            </span>
          </div>
          <div>
            <span className="mb-1 block text-muted-foreground text-xs uppercase tracking-wider">
              Panel
            </span>
            <span className="font-medium capitalize">
              {form.getValues("panels") || "—"}
            </span>
          </div>
        </div>
      </div>

      {(form.getValues("attributes")?.length ?? 0) > 0 && (
          <div className="space-y-4 rounded-lg border bg-muted/10 p-5">
            <h4 className="flex justify-between border-b pb-2 font-semibold text-sm">
              <span>Dynamic Attributes</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs">
                {form.getValues("attributes")?.length}
              </span>
            </h4>
            <ul className="mt-3 space-y-3 text-sm">
              {form.getValues("attributes")?.map((attr, i) => (
                <li
                  className="flex items-start gap-4 rounded-md border bg-background p-2"
                  key={i}
                >
                  <span
                    className="w-[140px] truncate font-medium text-xs uppercase tracking-wider"
                    title={attr.name}
                  >
                    {attr.name || "UNNAMED"}
                  </span>
                  <span className="flex-1 break-words text-muted-foreground">
                    {attr.choices || "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}
