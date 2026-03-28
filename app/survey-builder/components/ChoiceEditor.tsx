"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  options: string[];
  onChange: (options: string[]) => void;
};

export function ChoiceEditor({ options, onChange }: Props) {
  const handleChange = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...options, ""]);
  };

  const handleDelete = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Options
      </p>
      <div className="space-y-1.5">
        {options.map((opt, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable list manipulation
          <div className="flex items-center gap-2" key={i}>
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-medium text-[10px] text-muted-foreground">
              {i + 1}
            </div>
            <Input
              className="h-8 flex-1 text-sm"
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              value={opt}
            />
            <Button
              className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
              disabled={options.length <= 1}
              onClick={() => handleDelete(i)}
              size="icon"
              variant="ghost"
            >
              <XIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        className="mt-1 w-full gap-1.5 border-dashed text-xs"
        onClick={handleAdd}
        size="sm"
        variant="outline"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Add Option
      </Button>
    </div>
  );
}
