"use client";

import { useCallback, useState } from "react";
import { AddQuestionDialog } from "@/app/survey-builder/components/AddQuestionDialog";
import { QuestionList } from "@/app/survey-builder/components/QuestionList";
import { QuestionSettings } from "@/app/survey-builder/components/QuestionSettings";
import type {
  QuestionType,
  ScreeningRule,
  SurveyQuestion,
} from "@/app/survey-builder/types";

function genId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function defaultQuestion(type: QuestionType): SurveyQuestion {
  const isChoice = ["single_choice", "multiple_choice", "dropdown"].includes(
    type
  );
  return {
    id: genId(),
    type,
    question: "",
    description: "",
    required: false,
    options: isChoice ? ["Option 1", "Option 2"] : undefined,
    ratingMax: type === "rating" ? 5 : undefined,
  };
}

type Props = {
  questions: SurveyQuestion[];
  rules: ScreeningRule[];
  onQuestionsChange: (questions: SurveyQuestion[]) => void;
  onRulesChange: (rules: ScreeningRule[]) => void;
};

export function SurveyBuilderStep({
  questions,
  rules,
  onQuestionsChange,
  onRulesChange,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    questions[0]?.id ?? null
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // ── Question mutations ─────────────────────────────────────────────────────

  const handleSelectType = useCallback(
    (type: QuestionType) => {
      const q = defaultQuestion(type);
      onQuestionsChange([...questions, q]);
      setSelectedId(q.id);
    },
    [questions, onQuestionsChange]
  );

  const handleUpdateQuestion = useCallback(
    (id: string, updates: Partial<SurveyQuestion>) => {
      onQuestionsChange(
        questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
      );
    },
    [questions, onQuestionsChange]
  );

  const handleDeleteQuestion = useCallback(
    (id: string) => {
      const remaining = questions.filter((q) => q.id !== id);
      onQuestionsChange(remaining);
      onRulesChange(rules.filter((r) => r.questionId !== id));
      setSelectedId((prev) => {
        if (prev !== id) {
          return prev;
        }
        return remaining[0]?.id ?? null;
      });
    },
    [questions, rules, onQuestionsChange, onRulesChange]
  );

  const handleDuplicateQuestion = useCallback(
    (id: string) => {
      const q = questions.find((q) => q.id === id);
      if (!q) {
        return;
      }
      const copy: SurveyQuestion = { ...q, id: genId() };
      const idx = questions.findIndex((q) => q.id === id);
      const next = [...questions];
      next.splice(idx + 1, 0, copy);
      onQuestionsChange(next);
    },
    [questions, onQuestionsChange]
  );

  const handleReorder = useCallback(
    (reordered: SurveyQuestion[]) => onQuestionsChange(reordered),
    [onQuestionsChange]
  );

  // ── Rule mutations ─────────────────────────────────────────────────────────

  const handleAddRule = useCallback(
    (rule: Omit<ScreeningRule, "id">) => {
      onRulesChange([...rules, { ...rule, id: genId() }]);
    },
    [rules, onRulesChange]
  );

  const handleUpdateRule = useCallback(
    (id: string, updates: Partial<ScreeningRule>) => {
      onRulesChange(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    },
    [rules, onRulesChange]
  );

  const handleDeleteRule = useCallback(
    (id: string) => {
      onRulesChange(rules.filter((r) => r.id !== id));
    },
    [rules, onRulesChange]
  );

  // ── Derived ────────────────────────────────────────────────────────────────

  const selectedQuestion = questions.find((q) => q.id === selectedId) ?? null;
  const selectedIndex = questions.findIndex((q) => q.id === selectedId);

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-3 text-muted-foreground text-sm">
        Build a screening survey that participants will complete before their
        interview. Add questions, configure logic rules, and drag to reorder.
      </p>

      {/* Two-panel builder */}
      <div
        className="flex overflow-hidden rounded-lg border"
        style={{ minHeight: 480 }}
      >
        {/* Left – question list */}
        <div className="flex w-[260px] shrink-0 flex-col overflow-hidden border-r bg-muted/10">
          <QuestionList
            onAddQuestion={() => setAddDialogOpen(true)}
            onDelete={handleDeleteQuestion}
            onDuplicate={handleDuplicateQuestion}
            onReorder={handleReorder}
            onSelect={setSelectedId}
            questions={questions}
            selectedId={selectedId}
          />
        </div>

        {/* Right – settings or empty state */}
        <div className="flex-1 overflow-hidden bg-background">
          {selectedQuestion ? (
            <QuestionSettings
              onAddRule={handleAddRule}
              onDeleteRule={handleDeleteRule}
              onUpdate={(updates) =>
                handleUpdateQuestion(selectedQuestion.id, updates)
              }
              onUpdateRule={handleUpdateRule}
              question={selectedQuestion}
              questionIndex={selectedIndex}
              rules={rules}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <svg
                  className="h-6 w-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  No question selected
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  Add a question on the left to get started, or select one to
                  configure it.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddQuestionDialog
        onOpenChange={setAddDialogOpen}
        onSelectType={handleSelectType}
        open={addDialogOpen}
      />
    </div>
  );
}
