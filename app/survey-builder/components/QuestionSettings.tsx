"use client";

import { SettingsIcon, ShieldIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionType, ScreeningRule, SurveyQuestion } from "../types";
import { ChoiceEditor } from "./ChoiceEditor";
import { LogicRulesEditor } from "./LogicRulesEditor";

const CHOICE_TYPES: QuestionType[] = [
  "single_choice",
  "multiple_choice",
  "dropdown",
];

const TYPE_COLORS: Record<QuestionType, string> = {
  short_text: "bg-blue-50 text-blue-600 border-blue-200",
  long_text: "bg-indigo-50 text-indigo-600 border-indigo-200",
  single_choice: "bg-violet-50 text-violet-600 border-violet-200",
  multiple_choice: "bg-purple-50 text-purple-600 border-purple-200",
  dropdown: "bg-pink-50 text-pink-600 border-pink-200",
  number: "bg-orange-50 text-orange-600 border-orange-200",
  rating: "bg-amber-50 text-amber-600 border-amber-200",
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

type Props = {
  question: SurveyQuestion;
  questionIndex: number;
  rules: ScreeningRule[];
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onAddRule: (rule: Omit<ScreeningRule, "id">) => void;
  onUpdateRule: (id: string, updates: Partial<ScreeningRule>) => void;
  onDeleteRule: (id: string) => void;
};

export function QuestionSettings({
  question,
  questionIndex,
  rules,
  onUpdate,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
}: Props) {
  const isChoiceType = CHOICE_TYPES.includes(question.type);
  const questionRules = rules.filter((r) => r.questionId === question.id);

  return (
    <div className="flex h-full flex-col">
      {/* Settings panel header */}
      <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-muted-foreground text-xs">
            Q{questionIndex + 1}
          </span>
          <Badge
            className={`px-2 py-0 text-[10px] ${TYPE_COLORS[question.type]}`}
            variant="outline"
          >
            {TYPE_LABELS[question.type]}
          </Badge>
        </div>
        {questionRules.length > 0 && (
          <Badge
            className="border-rose-200 bg-rose-50 px-2 text-[10px] text-rose-600"
            variant="outline"
          >
            {questionRules.length} rule{questionRules.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Tabs: Settings | Logic */}
      <Tabs
        className="flex flex-1 flex-col overflow-hidden"
        defaultValue="settings"
      >
        <div className="shrink-0 px-5 pt-3">
          <TabsList className="grid h-8 w-full grid-cols-2">
            <TabsTrigger className="gap-1.5 text-xs" value="settings">
              <SettingsIcon className="h-3 w-3" />
              Settings
            </TabsTrigger>
            <TabsTrigger className="relative gap-1.5 text-xs" value="logic">
              <ShieldIcon className="h-3 w-3" />
              Logic
              {questionRules.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 font-bold text-[8px] text-white">
                  {questionRules.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Settings tab */}
        <TabsContent
          className="mt-0 flex-1 space-y-5 overflow-y-auto px-5 py-4"
          value="settings"
        >
          {/* Question text */}
          <div className="space-y-1.5">
            <label
              className="font-semibold text-foreground text-xs"
              htmlFor="q-text"
            >
              Question Text
              {question.required && (
                <span className="ml-1 text-rose-500">*</span>
              )}
            </label>
            <Textarea
              className="min-h-[72px] resize-none text-sm"
              id="q-text"
              onChange={(e) => onUpdate({ question: e.target.value })}
              placeholder="What is your question?"
              value={question.question}
            />
          </div>

          {/* Helper text */}
          <div className="space-y-1.5">
            <label
              className="font-semibold text-foreground text-xs"
              htmlFor="q-desc"
            >
              Description
              <span className="ml-1.5 font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              className="h-8 text-sm"
              id="q-desc"
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Add helper text for participants…"
              value={question.description ?? ""}
            />
          </div>

          <Separator />

          {/* Required toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Required</p>
              <p className="text-muted-foreground text-xs">
                Participants must answer this question
              </p>
            </div>
            <Switch
              checked={question.required}
              onCheckedChange={(v) => onUpdate({ required: v })}
            />
          </div>

          {/* Choice editor — only for choice-based types */}
          {isChoiceType && (
            <>
              <Separator />
              <ChoiceEditor
                onChange={(options) => onUpdate({ options })}
                options={question.options ?? []}
              />
            </>
          )}

          {/* Rating max */}
          {question.type === "rating" && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <label className="font-semibold text-xs" htmlFor="rating-max">
                  Scale Max
                </label>
                <div className="flex gap-2">
                  {[5, 7, 10].map((n) => (
                    <button
                      className={`flex-1 rounded-md border py-1.5 font-medium text-sm transition-all ${
                        (question.ratingMax ?? 5) === n
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                      key={n}
                      onClick={() => onUpdate({ ratingMax: n })}
                      type="button"
                    >
                      1 – {n}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Logic tab */}
        <TabsContent
          className="mt-0 flex-1 overflow-y-auto px-5 py-4"
          value="logic"
        >
          <LogicRulesEditor
            onAddRule={onAddRule}
            onDeleteRule={onDeleteRule}
            onUpdateRule={onUpdateRule}
            question={question}
            questionId={question.id}
            rules={questionRules}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
