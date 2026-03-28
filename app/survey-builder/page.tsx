"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { surveysApi } from "@/lib/api/surveys";
import { AddQuestionDialog } from "./components/AddQuestionDialog";
import { QuestionList } from "./components/QuestionList";
import { QuestionSettings } from "./components/QuestionSettings";
import { SurveyHeader } from "./components/SurveyHeader";
import { SurveyPreview } from "./components/SurveyPreview";
import { MOCK_SURVEY } from "./data";
import type {
  QuestionType,
  ScreeningRule,
  Survey,
  SurveyQuestion,
} from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

export default function SurveyBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <p className="animate-pulse text-muted-foreground">
            Loading builder...
          </p>
        </div>
      }
    >
      <SurveyBuilderInner />
    </Suspense>
  );
}

function SurveyBuilderInner() {
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("id");

  const [survey, setSurvey] = useState<Survey>({ ...MOCK_SURVEY });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    async function fetchSurveyData() {
      if (surveyId) {
        try {
          const data = await surveysApi.getSurveysList();
          const found = data?.find((s) => s.id === surveyId);
          if (found) {
            setSurvey(found);
            if (found.questions?.length > 0) {
              setSelectedId(found.questions[0].id);
            } else {
              setSelectedId(null);
            }
          } else {
            console.warn("Survey not found in list, falling back to mock");
            setSurvey({ ...MOCK_SURVEY });
            setSelectedId(MOCK_SURVEY.questions[0]?.id ?? null);
          }
        } catch (err) {
          console.error("Failed to fetch surveys:", err);
          setSurvey({ ...MOCK_SURVEY });
          setSelectedId(MOCK_SURVEY.questions[0]?.id ?? null);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Creating a new survey
        const newSurvey: Survey = {
          id: `survey_draft_${Date.now()}`,
          projectId: "",
          projectName: "", // User will name it or we can leave blank
          crowdId: "",
          crowdName: "",
          status: "draft",
          questions: [defaultQuestion("single_choice")],
          rules: [],
        };
        setSurvey(newSurvey);
        setSelectedId(newSurvey.questions[0].id);
        setIsLoading(false);
      }
    }
    fetchSurveyData();
  }, [surveyId]);

  // ── Question mutations ──────────────────────────────────────────────────────

  const handleSelectType = useCallback((type: QuestionType) => {
    const q = defaultQuestion(type);
    setSurvey((s) => ({ ...s, questions: [...s.questions, q] }));
    setSelectedId(q.id);
  }, []);

  const handleUpdateQuestion = useCallback(
    (id: string, updates: Partial<SurveyQuestion>) => {
      setSurvey((s) => ({
        ...s,
        questions: s.questions.map((q) =>
          q.id === id ? { ...q, ...updates } : q
        ),
      }));
    },
    []
  );

  const handleDeleteQuestion = useCallback(
    (id: string) => {
      setSurvey((s) => {
        const remaining = s.questions.filter((q) => q.id !== id);
        return {
          ...s,
          questions: remaining,
          rules: s.rules.filter((r) => r.questionId !== id),
        };
      });
      setSelectedId((prev) => {
        if (prev !== id) {
          return prev;
        }
        const remaining = survey.questions.filter((q) => q.id !== id);
        return remaining[0]?.id ?? null;
      });
    },
    [survey.questions]
  );

  const handleDuplicateQuestion = useCallback((id: string) => {
    setSurvey((s) => {
      const q = s.questions.find((q) => q.id === id);
      if (!q) {
        return s;
      }
      const copy: SurveyQuestion = { ...q, id: genId() };
      const idx = s.questions.findIndex((q) => q.id === id);
      const next = [...s.questions];
      next.splice(idx + 1, 0, copy);
      return { ...s, questions: next };
    });
  }, []);

  const handleReorder = useCallback((questions: SurveyQuestion[]) => {
    setSurvey((s) => ({ ...s, questions }));
  }, []);

  // ── Rule mutations ──────────────────────────────────────────────────────────

  const handleAddRule = useCallback((rule: Omit<ScreeningRule, "id">) => {
    setSurvey((s) => ({
      ...s,
      rules: [...s.rules, { ...rule, id: genId() }],
    }));
  }, []);

  const handleUpdateRule = useCallback(
    (id: string, updates: Partial<ScreeningRule>) => {
      setSurvey((s) => ({
        ...s,
        rules: s.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      }));
    },
    []
  );

  const handleDeleteRule = useCallback((id: string) => {
    setSurvey((s) => ({ ...s, rules: s.rules.filter((r) => r.id !== id) }));
  }, []);

  // ── Header actions ──────────────────────────────────────────────────────────

  const saveSurveyToApi = async (dataToSave: Survey) => {
    try {
      try {
        await surveysApi.updateSurvey(dataToSave.id, dataToSave);
      } catch (e: any) {
        if (
          e.response?.status === 404 ||
          e.status === 404 ||
          e.response?.status === 501
        ) {
          // If not found or not implemented, try creating via POST
          const created = await surveysApi.createSurvey(dataToSave);
          if (created && created.id) {
            setSurvey((prev) => ({ ...prev, id: created.id }));
          }
        } else {
          throw e;
        }
      }
    } catch (err) {
      console.error("API error making save/update call:", err);
      throw err;
    }
  };

  const handleSaveDraft = async () => {
    setSaveStatus("saving");
    try {
      await saveSurveyToApi(survey);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to save survey", err);
      setSaveStatus("idle"); // reset on error
    }
  };

  const handlePublish = async () => {
    const updated = { ...survey, status: "published" as const };
    setSurvey(updated);
    setSaveStatus("saving");
    try {
      await saveSurveyToApi(updated);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to publish survey", err);
      setSaveStatus("idle");
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  const selectedQuestion =
    survey.questions.find((q) => q.id === selectedId) ?? null;
  const selectedIndex = survey.questions.findIndex((q) => q.id === selectedId);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full items-center justify-center">
            <p className="animate-pulse text-muted-foreground">
              Loading survey...
            </p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Page header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/surveys">Surveys</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {surveyId
                      ? survey.projectName || "Untitled Survey"
                      : "New Survey"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Survey builder */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Survey header with actions */}
          <SurveyHeader
            onPreview={() => setPreviewOpen(true)}
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
            survey={survey}
          />

          {/* Two-panel layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left panel — Question List */}
            <div className="flex w-[300px] shrink-0 flex-col overflow-hidden border-r bg-muted/10">
              <QuestionList
                onAddQuestion={() => setAddDialogOpen(true)}
                onDelete={handleDeleteQuestion}
                onDuplicate={handleDuplicateQuestion}
                onReorder={handleReorder}
                onSelect={setSelectedId}
                questions={survey.questions}
                selectedId={selectedId}
              />
            </div>

            {/* Right panel — Question Settings or empty state */}
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
                  rules={survey.rules}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                    <svg
                      className="h-7 w-7 text-muted-foreground"
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
                      Select a question
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Click any question on the left to configure it, or add a
                      new one to get started.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <AddQuestionDialog
          onOpenChange={setAddDialogOpen}
          onSelectType={handleSelectType}
          open={addDialogOpen}
        />

        <SurveyPreview
          crowdName={survey.crowdName}
          onOpenChange={setPreviewOpen}
          open={previewOpen}
          projectName={survey.projectName}
          questions={survey.questions}
          rules={survey.rules}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
