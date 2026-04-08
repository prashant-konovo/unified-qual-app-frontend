"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type {
  ScreeningRule,
  Survey,
  SurveyQuestion,
} from "@/app/survey-builder/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { projectsApi } from "@/lib/api/projects";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { surveysApi } from "@/lib/api/surveys";
import {
  type FormValues,
  formSchema,
  getFieldsForStep,
  ParticipantGroupsStep,
  ProjectInfoStep,
  ReviewStep,
  SurveyStep,
  steps,
  TimelineSettingsStep,
} from "./components";

export default function NewProjectWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Survey builder state (lives outside react-hook-form since it's complex)
  const [surveyQuestions, setSurveyQuestions] = React.useState<
    SurveyQuestion[]
  >([]);
  const [surveyRules, setSurveyRules] = React.useState<ScreeningRule[]>([]);

  // Survey attachment state
  const [surveyMode, setSurveyMode] = React.useState<"create" | "attach">(
    "create"
  );
  const [linkedSurveyId, setLinkedSurveyId] = React.useState<string>("");
  const [availableSurveys, setAvailableSurveys] = React.useState<Survey[]>([]);
  const [isLoadingSurveys, setIsLoadingSurveys] = React.useState(false);

  // Subscription attachment state
  const [availableSubscriptions, setAvailableSubscriptions] = React.useState<
    any[]
  >([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] =
    React.useState(false);

  React.useEffect(() => {
    // Fetch subscriptions for Step 1
    setIsLoadingSubscriptions(true);
    subscriptionsApi
      .getSubscriptionsList()
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableSubscriptions(data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingSubscriptions(false));
  }, []);

  React.useEffect(() => {
    if (currentStep === 3) {
      setIsLoadingSurveys(true);
      surveysApi
        .getSurveysList()
        .then((data) => {
          if (Array.isArray(data)) {
            setAvailableSurveys(data.filter((s) => s.status === "published"));
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingSurveys(false));
    }
  }, [currentStep]);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      interviewLength: "",
      salesforceProject: "",
      subscriptionId: "none",
      conferenceType: "none",
      conferenceLink: "",
      participantGroups: [{ crowdName: "", profession: "", sampleSize: 1 }],
      recruitmentDate: "",
      enableStimulusSharing: false,
      transcription: "transcribe",
      notes: "",
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "participantGroups",
  });

  const processNextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid && currentStep < steps.length) {
      setCurrentStep((step) => step + 1);
    }
  };

  const processPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    }
  };

  const onSubmit = async (data: FormValues) => {
    // Intercept premature submissions (like pressing Enter inside an input field)
    if (currentStep < steps.length) {
      processNextStep();
      return;
    }

    setIsSubmitting(true);
    try {
      let finalSurveyId;

      if (surveyMode === "create" && surveyQuestions.length > 0) {
        // Build new survey entirely
        const newSurveyPayload = {
          projectName: data.projectName,
          status: "draft" as const,
          questions: surveyQuestions,
          rules: surveyRules,
        };
        const createdSurvey = await surveysApi.createSurvey(newSurveyPayload);
        if (createdSurvey?.id) {
          finalSurveyId = createdSurvey.id;
        }
      } else if (surveyMode === "attach" && linkedSurveyId) {
        finalSurveyId = linkedSurveyId;
      }

      const fullPayload = {
        name: data.projectName,
        source: "qs", // default to QS (MRA)
        interviewLength: data.interviewLength
          ? Number(data.interviewLength)
          : undefined,
        salesforceJobNumber: data.salesforceProject || undefined,
        sampleSize: data.participantGroups.reduce(
          (sum, g) => sum + g.sampleSize,
          0
        ),
        subscriptionId:
          data.subscriptionId === "none"
            ? undefined
            : data.subscriptionId
              ? Number(data.subscriptionId)
              : undefined,
      };

      console.log("Creating Project with payload:", fullPayload);
      await projectsApi.createProject(fullPayload as any);

      toast.success("Project created successfully!");
      router.push("/projects");
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/projects">Projects</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-lg">
                  New Project
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="min-h-screen bg-zinc-50/50 px-4 py-8 sm:px-6 lg:px-8 dark:bg-zinc-950/20">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header Area */}
          <div className="space-y-2 text-center">
            <h1 className="font-bold text-3xl text-foreground tracking-tight">
              Create New Project
            </h1>
            <p className="text-muted-foreground">
              Set up your research project in a few simple steps
            </p>
          </div>

          {/* Stepper Wizard Indicator */}
          <div className="relative">
            {/* Background line (uncompleted) */}
            <div className="absolute top-4 left-[10%] -z-10 h-0.5 w-[80%] bg-zinc-200 dark:bg-zinc-800" />
            {/* Foreground line (progress) */}
            <div
              className="absolute top-4 left-[10%] z-0 h-0.5 bg-primary transition-all duration-500 ease-in-out"
              style={{
                width: `calc(${((currentStep - 1) / (steps.length - 1)) * 80}%)`,
              }}
            />
            <nav
              aria-label="Progress"
              className="relative z-10 flex w-full justify-between px-2 sm:px-4"
            >
              {steps.map((step) => (
                <div className="flex flex-col items-center gap-2" key={step.id}>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background transition-colors duration-300 ${
                      currentStep > step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep === step.id
                          ? "border-primary text-primary ring-4 ring-primary/20"
                          : "border-zinc-200 text-zinc-400 dark:border-zinc-800"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      <span className="text-center font-semibold text-sm">
                        {step.id}
                      </span>
                    )}
                  </div>
                  <span
                    className={`hidden max-w-[80px] text-center font-medium text-xs sm:block ${
                      currentStep >= step.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          {/* Form Content Card */}
          <Card className="rounded-xl border-zinc-200/60 shadow-sm transition-all duration-300 dark:border-zinc-800/60">
            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 1 && (
                <ProjectInfoStep
                  availableSubscriptions={availableSubscriptions}
                  control={control}
                  errors={errors}
                  isLoadingSubscriptions={isLoadingSubscriptions}
                  register={register}
                />
              )}

              {currentStep === 2 && (
                <ParticipantGroupsStep
                  append={append}
                  control={control}
                  errors={errors}
                  fields={fields}
                  register={register}
                  remove={remove}
                />
              )}

              {currentStep === 3 && (
                <SurveyStep
                  availableSurveys={availableSurveys}
                  isLoadingSurveys={isLoadingSurveys}
                  linkedSurveyId={linkedSurveyId}
                  setLinkedSurveyId={setLinkedSurveyId}
                  setSurveyMode={setSurveyMode}
                  setSurveyQuestions={setSurveyQuestions}
                  setSurveyRules={setSurveyRules}
                  surveyMode={surveyMode}
                  surveyQuestions={surveyQuestions}
                  surveyRules={surveyRules}
                />
              )}

              {currentStep === 4 && (
                <TimelineSettingsStep
                  control={control}
                  errors={errors}
                  register={register}
                />
              )}

              {currentStep === 5 && (
                <ReviewStep
                  control={control}
                  errors={errors}
                  register={register}
                  surveyQuestions={surveyQuestions}
                  surveyRules={surveyRules}
                />
              )}

              {/* Form Navigation / Footer */}
              <CardFooter className="mt-4 flex justify-between border-t p-6">
                <Button
                  className="w-[100px]"
                  disabled={currentStep === 1}
                  onClick={processPrevStep}
                  type="button"
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    className="w-[120px]"
                    onClick={processNextStep}
                    type="button"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    className="w-[140px] shadow-md transition-all hover:shadow-lg"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
