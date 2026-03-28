"use client";

import { EyeIcon, LayersIcon, SaveIcon, SendIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Survey } from "../types";

type Props = {
  survey: Survey;
  onPreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
};

export function SurveyHeader({
  survey,
  onPreview,
  onSaveDraft,
  onPublish,
}: Props) {
  return (
    <div className="border-b bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: title + metadata */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <LayersIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight">
                  Survey Builder
                </h1>
                <Badge
                  className={
                    survey.status === "published"
                      ? "border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700"
                      : "border-amber-300 bg-amber-50 text-[10px] text-amber-700"
                  }
                  variant="outline"
                >
                  {survey.status === "published" ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="mt-0.5 text-muted-foreground text-xs">
                <span className="font-medium text-foreground">
                  {survey.projectName}
                </span>
                <span className="mx-1.5 text-border">·</span>
                <span>{survey.crowdName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <Button
            className="gap-1.5"
            onClick={onPreview}
            size="sm"
            variant="outline"
          >
            <EyeIcon className="h-3.5 w-3.5" />
            Preview
          </Button>
          <Button
            className="gap-1.5"
            onClick={onSaveDraft}
            size="sm"
            variant="outline"
          >
            <SaveIcon className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button className="gap-1.5" onClick={onPublish} size="sm">
            <SendIcon className="h-3.5 w-3.5" />
            Publish Survey
          </Button>
        </div>
      </div>
      <Separator />
    </div>
  );
}
