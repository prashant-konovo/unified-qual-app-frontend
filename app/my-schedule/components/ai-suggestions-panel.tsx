"use client";

import { ChevronDown, ChevronUp, Loader2, Sparkles, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { AISuggestedSlot } from "@/lib/api/timeslots";
import { timeslotsApi } from "@/lib/api/timeslots";

interface ProjectOption {
  id: string;
  name: string;
}

interface AISuggestionsPanelProps {
  onCreateSlots: (slots: AISuggestedSlot[]) => void;
  projects: ProjectOption[];
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AISuggestionsPanel({
  projects,
  onCreateSlots,
}: AISuggestionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [suggestions, setSuggestions] = useState<AISuggestedSlot[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(
    new Set()
  );

  // Default to first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const fetchSuggestions = useCallback(async () => {
    if (!selectedProjectId) {
      return;
    }
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await timeslotsApi.getAISuggestions(selectedProjectId);
      setSuggestions(result.suggestions);
    } catch {
      toast.error("Failed to load AI suggestions");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  const toggleSuggestion = (index: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleCreateAll = () => {
    onCreateSlots(suggestions);
    toast.success(`Creating ${suggestions.length} suggested slots`);
  };

  const handleCreateSelected = () => {
    const selected = suggestions.filter((_, i) => selectedSuggestions.has(i));
    if (selected.length === 0) {
      toast.error("Select at least one slot to create");
      return;
    }
    onCreateSlots(selected);
    toast.success(`Creating ${selected.length} selected slots`);
  };

  return (
    <div className="rounded-xl border border-violet-200/60 bg-card shadow-sm dark:border-violet-800/30">
      {/* Header */}
      <button
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
        onClick={() => {
          setIsOpen((v) => !v);
          if (!isOpen && suggestions.length === 0) {
            fetchSuggestions();
          }
        }}
        type="button"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <span className="font-semibold text-sm">AI Suggested Slots</span>
          {suggestions.length > 0 && (
            <Badge
              className="border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-400"
              variant="outline"
            >
              {suggestions.length}
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <>
          <Separator />
          <div className="space-y-3 p-4">
            {/* Project selector */}
            {projects.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Project:</span>
                <select
                  className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  value={selectedProjectId}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <Button
                  disabled={isLoading}
                  onClick={fetchSuggestions}
                  size="sm"
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Suggestions list */}
            {!isLoading && suggestions.length === 0 && (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No waiting participants yet.
              </p>
            )}

            {!isLoading && suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">
                  Ranked by participant demand
                </p>
                {suggestions.map((s, i) => (
                  <button
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      selectedSuggestions.has(i)
                        ? "border-violet-400 bg-violet-50 dark:border-violet-600 dark:bg-violet-950"
                        : "border-border hover:border-violet-300 hover:bg-accent"
                    }`}
                    key={s.suggestedStart}
                    onClick={() => toggleSuggestion(i)}
                    type="button"
                  >
                    <span className="font-medium">
                      {formatTime(s.suggestedStart)} –{" "}
                      {formatTime(s.suggestedEnd)}
                    </span>
                    <Badge
                      className="border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-300"
                      variant="outline"
                    >
                      {s.participantCount} participant
                      {s.participantCount !== 1 ? "s" : ""}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            {!isLoading && suggestions.length > 0 && (
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1"
                  onClick={handleCreateAll}
                  size="sm"
                  variant="outline"
                >
                  <Zap className="mr-1.5 h-3 w-3" />
                  Create All
                </Button>
                <Button
                  className="flex-1"
                  disabled={selectedSuggestions.size === 0}
                  onClick={handleCreateSelected}
                  size="sm"
                >
                  Create Selected ({selectedSuggestions.size})
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
