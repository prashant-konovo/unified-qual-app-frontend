"use client";

import {
  AlignLeftIcon,
  CheckSquareIcon,
  ChevronDownIcon,
  CircleDotIcon,
  HashIcon,
  StarIcon,
  TypeIcon,
} from "lucide-react";
import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { QuestionType } from "../types";

interface TypeOption {
  color: string;
  description: string;
  icon: React.ReactNode;
  label: string;
  type: QuestionType;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: "short_text",
    label: "Short Text",
    description: "Single line answer",
    icon: <TypeIcon className="h-5 w-5" />,
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    type: "long_text",
    label: "Long Text",
    description: "Multi-line answer",
    icon: <AlignLeftIcon className="h-5 w-5" />,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    type: "single_choice",
    label: "Single Choice",
    description: "Pick one option",
    icon: <CircleDotIcon className="h-5 w-5" />,
    color: "bg-violet-50 text-violet-600 border-violet-100",
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    description: "Pick multiple options",
    icon: <CheckSquareIcon className="h-5 w-5" />,
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    description: "Choose from a list",
    icon: <ChevronDownIcon className="h-5 w-5" />,
    color: "bg-pink-50 text-pink-600 border-pink-100",
  },
  {
    type: "number",
    label: "Number",
    description: "Numerical input",
    icon: <HashIcon className="h-5 w-5" />,
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    type: "rating",
    label: "Rating Scale",
    description: "Star or number scale",
    icon: <StarIcon className="h-5 w-5" />,
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
];

interface Props {
  onOpenChange: (v: boolean) => void;
  onSelectType: (type: QuestionType) => void;
  open: boolean;
}

export function AddQuestionDialog({ open, onOpenChange, onSelectType }: Props) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a Question</DialogTitle>
          <DialogDescription>
            Choose the type of question to add to your survey.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                "hover:scale-[1.01] hover:shadow-sm active:scale-[0.99]",
                "hover:border-primary/40 hover:bg-primary/5"
              )}
              key={opt.type}
              onClick={() => {
                onSelectType(opt.type);
                onOpenChange(false);
              }}
              type="button"
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                  opt.color
                )}
              >
                {opt.icon}
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">
                  {opt.label}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {opt.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
