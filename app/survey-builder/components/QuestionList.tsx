"use client";

import { ClipboardListIcon, PlusIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SurveyQuestion } from "../types";
import { QuestionCard } from "./QuestionCard";

interface Props {
  onAddQuestion: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (questions: SurveyQuestion[]) => void;
  onSelect: (id: string) => void;
  questions: SurveyQuestion[];
  selectedId: string | null;
}

export function QuestionList({
  questions,
  selectedId,
  onSelect,
  onReorder,
  onDelete,
  onDuplicate,
  onAddQuestion,
}: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDragOverId(null);
      return;
    }

    const from = questions.findIndex((q) => q.id === draggedId);
    const to = questions.findIndex((q) => q.id === targetId);
    if (from === -1 || to === -1) {
      return;
    }

    const next = [...questions];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
    setDragOverId(null);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Questions</span>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs tabular-nums">
          {questions.length}
        </span>
      </div>

      {/* Question cards */}
      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
        {questions.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <PlusIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground text-sm">
              No questions yet
            </p>
            <p className="text-muted-foreground text-xs">
              Click below to add your first question.
            </p>
          </div>
        ) : (
          questions.map((q, i) => (
            <QuestionCard
              index={i}
              isDragOver={dragOverId === q.id}
              isSelected={q.id === selectedId}
              key={q.id}
              onClick={() => onSelect(q.id)}
              onDelete={() => onDelete(q.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, q.id)}
              onDragStart={(e) => handleDragStart(e, q.id)}
              onDrop={(e) => handleDrop(e, q.id)}
              onDuplicate={() => onDuplicate(q.id)}
              question={q}
            />
          ))
        )}
      </div>

      {/* Bottom actions */}
      <div className="shrink-0 space-y-2 border-t px-3 py-3">
        <Button
          className="w-full gap-2 border-dashed text-sm"
          onClick={onAddQuestion}
          variant="outline"
        >
          <PlusIcon className="h-4 w-4" />
          Add Question
        </Button>
      </div>
    </div>
  );
}
