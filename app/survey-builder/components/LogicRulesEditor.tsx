"use client";

import {
  PlusIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  TrashIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScreeningRule, SurveyQuestion } from "../types";
import { CONDITION_LABELS } from "../types";

interface Props {
  onAddRule: (rule: Omit<ScreeningRule, "id">) => void;
  onDeleteRule: (id: string) => void;
  onUpdateRule: (id: string, updates: Partial<ScreeningRule>) => void;
  question: SurveyQuestion;
  questionId: string;
  rules: ScreeningRule[];
}

export function LogicRulesEditor({
  questionId,
  question,
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
}: Props) {
  const handleAddRule = () => {
    onAddRule({
      questionId,
      condition: "equals",
      value: "",
      action: "disqualify",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">Screening Logic</p>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Define rules to qualify or disqualify participants.
          </p>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-4 text-center">
          <p className="text-muted-foreground text-xs">
            No rules yet. Add a rule to screen participants.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              className="space-y-2 rounded-lg border bg-muted/30 p-3"
              key={rule.id}
            >
              {/* Action badge row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                    If answer
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Select
                    onValueChange={(v) =>
                      onUpdateRule(rule.id, {
                        action: v as ScreeningRule["action"],
                      })
                    }
                    value={rule.action}
                  >
                    <SelectTrigger className="h-6 w-auto border-none bg-transparent px-0 text-[11px] shadow-none">
                      <Badge
                        className={
                          rule.action === "disqualify"
                            ? "gap-1 border-rose-300 bg-rose-50 text-rose-700"
                            : "gap-1 border-emerald-300 bg-emerald-50 text-emerald-700"
                        }
                        variant="outline"
                      >
                        {rule.action === "disqualify" ? (
                          <ShieldXIcon className="h-3 w-3" />
                        ) : (
                          <ShieldCheckIcon className="h-3 w-3" />
                        )}
                        {rule.action === "disqualify"
                          ? "Disqualify"
                          : "Qualify"}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="text-xs" value="disqualify">
                        <div className="flex items-center gap-1.5">
                          <ShieldXIcon className="h-3.5 w-3.5 text-rose-500" />
                          Disqualify
                        </div>
                      </SelectItem>
                      <SelectItem className="text-xs" value="qualify">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                          Qualify
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className="h-5 w-5 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteRule(rule.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Condition row */}
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={(v) =>
                    onUpdateRule(rule.id, {
                      condition: v as ScreeningRule["condition"],
                    })
                  }
                  value={rule.condition}
                >
                  <SelectTrigger className="h-7 flex-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.keys(
                        CONDITION_LABELS
                      ) as ScreeningRule["condition"][]
                    ).map((cond) => (
                      <SelectItem className="text-xs" key={cond} value={cond}>
                        {CONDITION_LABELS[cond]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Value picker — if choice, show options; otherwise free text */}
                {question.options && question.options.length > 0 ? (
                  <Select
                    onValueChange={(v) => onUpdateRule(rule.id, { value: v })}
                    value={rule.value}
                  >
                    <SelectTrigger className="h-7 flex-1 text-xs">
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options.map((opt) => (
                        <SelectItem className="text-xs" key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="h-7 flex-1 text-xs"
                    onChange={(e) =>
                      onUpdateRule(rule.id, { value: e.target.value })
                    }
                    placeholder="Value"
                    value={rule.value}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        className="w-full gap-1.5 border-dashed text-xs"
        onClick={handleAddRule}
        size="sm"
        variant="outline"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Add Rule
      </Button>
    </div>
  );
}
