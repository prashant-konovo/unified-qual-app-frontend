"use client";

import {
  AlignLeftIcon,
  CheckSquareIcon,
  ChevronDownIcon,
  CircleDotIcon,
  CopyIcon,
  GripVerticalIcon,
  HashIcon,
  MoreHorizontalIcon,
  StarIcon,
  TrashIcon,
  TypeIcon,
} from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { QuestionType, SurveyQuestion } from "../types";

const TYPE_ICONS: Record<QuestionType, React.ReactNode> = {
  short_text: <TypeIcon className="h-3.5 w-3.5" />,
  long_text: <AlignLeftIcon className="h-3.5 w-3.5" />,
  single_choice: <CircleDotIcon className="h-3.5 w-3.5" />,
  multiple_choice: <CheckSquareIcon className="h-3.5 w-3.5" />,
  dropdown: <ChevronDownIcon className="h-3.5 w-3.5" />,
  number: <HashIcon className="h-3.5 w-3.5" />,
  rating: <StarIcon className="h-3.5 w-3.5" />,
};

const TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short Text",
  long_text: "Long Text",
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  dropdown: "Dropdown",
  number: "Number",
  rating: "Rating",
};

interface Props {
  index: number;
  isDragOver: boolean;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDuplicate: () => void;
  question: SurveyQuestion;
}

export function QuestionCard({
  question,
  index,
  isSelected,
  isDragOver,
  onClick,
  onDelete,
  onDuplicate,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: Props) {
  return (
    <div
      className={cn(
        "group relative cursor-pointer select-none rounded-lg border bg-card transition-all",
        isSelected
          ? "border-primary shadow-sm ring-2 ring-primary/20"
          : "border-border hover:border-border/80 hover:shadow-sm",
        isDragOver && "scale-[0.99] border-primary/50 bg-primary/5"
      )}
      draggable
      onClick={onClick}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDrop={onDrop}
    >
      <div className="flex items-start gap-2.5 p-3">
        {/* Drag handle */}
        <div className="mt-0.5 shrink-0 cursor-grab text-muted-foreground/40 transition-colors hover:text-muted-foreground active:cursor-grabbing">
          <GripVerticalIcon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              Q{index + 1}
            </span>
            <Badge
              className="h-4 gap-1 px-1.5 py-0 font-normal text-[10px]"
              variant="secondary"
            >
              {TYPE_ICONS[question.type]}
              {TYPE_LABELS[question.type]}
            </Badge>
            {question.required && (
              <span className="font-medium text-[10px] text-rose-500">
                Required
              </span>
            )}
          </div>
          <p className="line-clamp-2 font-medium text-foreground text-sm leading-snug">
            {question.question || (
              <span className="text-muted-foreground italic">
                Untitled question
              </span>
            )}
          </p>
        </div>

        {/* Actions menu */}
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                size="icon"
                variant="ghost"
              >
                <MoreHorizontalIcon className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="gap-2 text-xs" onClick={onDuplicate}>
                <CopyIcon className="h-3.5 w-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive text-xs focus:text-destructive"
                onClick={onDelete}
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
