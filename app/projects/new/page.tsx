"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, ChevronRight, Loader2, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { projectsApi } from "@/lib/api/projects";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { surveysApi } from "@/lib/api/surveys";
import { SurveyBuilderStep } from "./SurveyBuilderStep";

const formSchema = z.object({
  // Step 1
  projectName: z.string().min(2, "Project name is required"),
  interviewLength: z.string().min(1, "Please select an interview length"),
  salesforceProject: z.string().min(1, "Please select a Salesforce project"),
  subscriptionId: z.string().optional(),
  conferenceType: z.enum(["zoom", "google_meet", "teams", "custom", "none"]),
  conferenceLink: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  // Step 2 (Dynamic Fields)
  participantGroups: z
    .array(
      z.object({
        crowdName: z.string().min(1, "Crowd name is required"),
        profession: z.string().min(1, "Profession is required"),
        sampleSize: z.number().min(1, "Sample size must be at least 1"),
      })
    )
    .min(1, "At least one participant group is required"),

  // Step 4
  recruitmentDate: z.string().min(1, "Please select a recruitment date"),
  enableStimulusSharing: z.boolean(),
  transcription: z.enum(["transcribe", "do-not-transcribe"]),

  // Step 5
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  { id: 1, name: "Project Information" },
  { id: 2, name: "Participant Groups" },
  { id: 3, name: "Survey Builder" },
  { id: 4, name: "Timeline & Settings" },
  { id: 5, name: "Review & Submit" },
];

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
        if (createdSurvey && createdSurvey.id) {
          finalSurveyId = createdSurvey.id;
        }
      } else if (surveyMode === "attach" && linkedSurveyId) {
        finalSurveyId = linkedSurveyId;
      }

      const fullPayload = {
        name: data.projectName,
        owner: "Current User",
        status: "Draft",
        interviewLength: data.interviewLength,
        salesforceProject: data.salesforceProject,
        participantGroups: data.participantGroups,
        recruitmentDate: data.recruitmentDate,
        enableStimulusSharing: data.enableStimulusSharing,
        transcription: data.transcription,
        notes: data.notes,
        surveyId: finalSurveyId,
        subscriptionId:
          data.subscriptionId === "none" ? undefined : data.subscriptionId,
        conferenceType:
          data.conferenceType === "none" ? undefined : data.conferenceType,
        conferenceLink: data.conferenceLink || undefined,
      };

      console.log("Creating Project with payload:", fullPayload);
      await projectsApi.createProject(fullPayload);

      toast.success("Project created successfully!");
      router.push("/projects");
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldsForStep = (step: number): any => {
    switch (step) {
      case 1:
        return ["projectName", "interviewLength", "salesforceProject"];
      case 2:
        return ["participantGroups"];
      case 3:
        return []; // Survey builder — no required fields, always valid
      case 4:
        return ["recruitmentDate", "enableStimulusSharing", "transcription"];
      default:
        return undefined;
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
              {/* ── Step 1: Project Information ─────────────────────────────── */}
              {currentStep === 1 && (
                <div className="slide-in-from-left-4 fade-in animate-in duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Project Information
                    </CardTitle>
                    <CardDescription>
                      Basic details to identify and configure your research.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        className="font-semibold text-foreground"
                        htmlFor="projectName"
                      >
                        Project Name
                      </Label>
                      <Input
                        id="projectName"
                        placeholder="e.g. Q4 Customer Feedback"
                        {...register("projectName")}
                        className={
                          errors.projectName
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                      {errors.projectName ? (
                        <p className="text-red-500 text-sm">
                          {errors.projectName.message}
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Name used internally to identify this research
                          project.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="font-semibold text-foreground"
                        htmlFor="interviewLength"
                      >
                        Interview Length
                      </Label>
                      <Controller
                        control={control}
                        name="interviewLength"
                        render={({ field }) => (
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={
                                errors.interviewLength ? "border-red-500" : ""
                              }
                            >
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">60 minutes</SelectItem>
                              <SelectItem value="90">90 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.interviewLength && (
                        <p className="text-red-500 text-sm">
                          {errors.interviewLength.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="font-semibold text-foreground"
                        htmlFor="salesforceProject"
                      >
                        Salesforce Project
                      </Label>
                      <Controller
                        control={control}
                        name="salesforceProject"
                        render={({ field }) => (
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={
                                errors.salesforceProject ? "border-red-500" : ""
                              }
                            >
                              <SelectValue placeholder="Link to Salesforce Opportunity..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="opp-1">
                                Acme Corp Enterprise Expansion
                              </SelectItem>
                              <SelectItem value="opp-2">
                                GlobalTech License Renewal
                              </SelectItem>
                              <SelectItem value="opp-3">
                                Stark Industries Phase 1
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.salesforceProject && (
                        <p className="text-red-500 text-sm">
                          {errors.salesforceProject.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="font-semibold text-foreground"
                        htmlFor="subscriptionId"
                      >
                        Link to Subscription (Optional)
                      </Label>
                      <Controller
                        control={control}
                        name="subscriptionId"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoadingSubscriptions
                                    ? "Loading..."
                                    : "Select Subscription"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {availableSubscriptions.map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  {sub.company} ({sub.plan})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className="text-muted-foreground text-sm">
                        Optionally attach this project to a master subscription
                        record.
                      </p>
                    </div>

                    {/* Conference Link */}
                    <div className="space-y-2">
                      <Label className="font-semibold text-foreground">
                        Conference Platform
                      </Label>
                      <p className="text-muted-foreground text-sm">
                        Choose the video platform moderators will use for
                        interviews.
                      </p>
                      <Controller
                        control={control}
                        name="conferenceType"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                Not specified
                              </SelectItem>
                              <SelectItem value="zoom">Zoom</SelectItem>
                              <SelectItem value="google_meet">
                                Google Meet
                              </SelectItem>
                              <SelectItem value="teams">
                                Microsoft Teams
                              </SelectItem>
                              <SelectItem value="custom">
                                Custom / Other
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <Controller
                      control={control}
                      name="conferenceType"
                      render={({ field: typeField }) => (
                        <>
                          {typeField.value !== "none" && (
                            <div className="space-y-2">
                              <Label
                                className="font-semibold text-foreground"
                                htmlFor="conferenceLink"
                              >
                                <Video className="mr-1.5 inline h-4 w-4 text-muted-foreground" />
                                Conference Link
                              </Label>
                              <Input
                                id="conferenceLink"
                                placeholder="https://zoom.us/j/123456789"
                                type="url"
                                {...register("conferenceLink")}
                                className={
                                  errors.conferenceLink ? "border-red-500" : ""
                                }
                              />
                              {errors.conferenceLink ? (
                                <p className="text-red-500 text-sm">
                                  {errors.conferenceLink.message}
                                </p>
                              ) : (
                                <p className="text-muted-foreground text-sm">
                                  This link will be shared with moderators and
                                  included in participant interview
                                  confirmations.
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    />
                  </CardContent>
                </div>
              )}

              {/* ── Step 2: Participant Groups ───────────────────────────────── */}
              {currentStep === 2 && (
                <div className="slide-in-from-left-4 fade-in animate-in duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Participant Groups
                    </CardTitle>
                    <CardDescription>
                      Define who you want to recruit for this research project.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                      <Card
                        className="relative border-zinc-200 bg-zinc-50/50 p-5 shadow-none dark:border-zinc-800 dark:bg-zinc-900/50"
                        key={field.id}
                      >
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label className="font-medium">Crowd Name</Label>
                            <Input
                              placeholder="e.g. IT Managers"
                              {...register(
                                `participantGroups.${index}.crowdName` as const
                              )}
                            />
                            {errors.participantGroups?.[index]?.crowdName && (
                              <p className="text-red-500 text-xs">
                                {
                                  errors.participantGroups[index]?.crowdName
                                    ?.message
                                }
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="font-medium">Profession</Label>
                            <Controller
                              control={control}
                              name={
                                `participantGroups.${index}.profession` as const
                              }
                              render={({ field }) => (
                                <Select
                                  defaultValue={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="engineering">
                                      Engineering
                                    </SelectItem>
                                    <SelectItem value="design">
                                      Design
                                    </SelectItem>
                                    <SelectItem value="product">
                                      Product Management
                                    </SelectItem>
                                    <SelectItem value="marketing">
                                      Marketing
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.participantGroups?.[index]?.profession && (
                              <p className="text-red-500 text-xs">
                                {
                                  errors.participantGroups[index]?.profession
                                    ?.message
                                }
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="font-medium">Sample Size</Label>
                            <Input
                              min="1"
                              type="number"
                              {...register(
                                `participantGroups.${index}.sampleSize` as const,
                                { valueAsNumber: true }
                              )}
                            />
                            {errors.participantGroups?.[index]?.sampleSize && (
                              <p className="text-red-500 text-xs">
                                {
                                  errors.participantGroups[index]?.sampleSize
                                    ?.message
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        {fields.length > 1 && (
                          <Button
                            className="absolute -top-3 -right-3 h-6 w-6 rounded-full border bg-background p-0 text-muted-foreground hover:bg-red-100 hover:text-red-600"
                            onClick={() => remove(index)}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            &times;
                          </Button>
                        )}
                      </Card>
                    ))}

                    <Button
                      className="mt-2 w-full border-2 border-dashed hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      onClick={() =>
                        append({ crowdName: "", profession: "", sampleSize: 1 })
                      }
                      type="button"
                      variant="outline"
                    >
                      + Add Participant Group
                    </Button>
                    {errors.participantGroups?.root && (
                      <p className="text-center text-red-500 text-sm">
                        {errors.participantGroups.root.message}
                      </p>
                    )}
                  </CardContent>
                </div>
              )}

              {/* ── Step 3: Survey Builder ───────────────────────────────────── */}
              {currentStep === 3 && (
                <div className="slide-in-from-left-4 fade-in animate-in duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl">Screening Survey</CardTitle>
                    <CardDescription>
                      Create a screening survey for participants or attach an
                      existing published one. This is optional.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup
                      className="flex flex-col gap-4 sm:flex-row"
                      onValueChange={(val) =>
                        setSurveyMode(val as "create" | "attach")
                      }
                      value={surveyMode}
                    >
                      <Label className="flex flex-1 cursor-pointer items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                        <RadioGroupItem className="sr-only" value="create" />
                        <div className="flex items-center gap-3">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary">
                            {surveyMode === "create" && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </span>
                          <span className="font-semibold text-sm">
                            Build New Survey
                          </span>
                        </div>
                      </Label>

                      <Label className="flex flex-1 cursor-pointer items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                        <RadioGroupItem className="sr-only" value="attach" />
                        <div className="flex items-center gap-3">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary">
                            {surveyMode === "attach" && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </span>
                          <span className="font-semibold text-sm">
                            Attach Existing
                          </span>
                        </div>
                      </Label>
                    </RadioGroup>

                    {surveyMode === "create" ? (
                      <div className="mt-4 border-t pt-4">
                        <SurveyBuilderStep
                          onQuestionsChange={setSurveyQuestions}
                          onRulesChange={setSurveyRules}
                          questions={surveyQuestions}
                          rules={surveyRules}
                        />
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <Label>Select Published Survey</Label>
                        {isLoadingSurveys ? (
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Fetching surveys...
                          </div>
                        ) : availableSurveys.length > 0 ? (
                          <Select
                            onValueChange={setLinkedSurveyId}
                            value={linkedSurveyId}
                          >
                            <SelectTrigger className="w-full sm:max-w-md">
                              <SelectValue placeholder="Select a survey" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSurveys.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.projectName || "Untitled"} (
                                  {s.questions?.length || 0} questions)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="rounded-md border bg-muted/50 p-4 text-muted-foreground text-sm">
                            No published surveys found. Switch to "Build New
                            Survey" to create one.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </div>
              )}

              {/* ── Step 4: Timeline & Settings ─────────────────────────────── */}
              {currentStep === 4 && (
                <div className="slide-in-from-left-4 fade-in animate-in duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Timeline & Settings
                    </CardTitle>
                    <CardDescription>
                      Configure project dates and technical preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-3">
                      <Label className="font-semibold text-base">
                        1. Recruitment Completion Date
                      </Label>
                      <p className="mb-3 text-muted-foreground text-sm">
                        When should all participants be scheduled by?
                      </p>
                      <Input
                        className="w-full sm:w-[280px]"
                        type="date"
                        {...register("recruitmentDate")}
                      />
                      {errors.recruitmentDate && (
                        <p className="text-red-500 text-sm">
                          {errors.recruitmentDate.message}
                        </p>
                      )}
                    </div>

                    <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />

                    <div className="space-y-3">
                      <Label className="font-semibold text-base">
                        2. Stimulus Sharing
                      </Label>
                      <p className="mb-4 text-muted-foreground text-sm">
                        Determine if you need advanced screen sharing
                        capabilities.
                      </p>

                      <div className="flex flex-row items-center justify-between rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                        <div className="space-y-0.5">
                          <Label className="text-base">
                            Enable Stimulus Sharing
                          </Label>
                          <p className="text-muted-foreground text-sm">
                            Participants will receive a secure screen sharing
                            link.
                          </p>
                        </div>
                        <Controller
                          control={control}
                          name="enableStimulusSharing"
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />

                    <div className="space-y-4">
                      <Label className="font-semibold text-base">
                        3. Transcription
                      </Label>
                      <p className="mb-2 text-muted-foreground text-sm">
                        Select how interview audio should be handled.
                      </p>

                      <Controller
                        control={control}
                        name="transcription"
                        render={({ field }) => (
                          <RadioGroup
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <Label className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                              <RadioGroupItem
                                className="sr-only"
                                value="transcribe"
                              />
                              <div className="flex w-full items-center gap-3">
                                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary">
                                  {field.value === "transcribe" && (
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                  )}
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-sm">
                                    Transcribe Interviews
                                  </span>
                                  <span className="font-normal text-muted-foreground text-xs">
                                    AI will automatically transcribe the
                                    sessions.
                                  </span>
                                </div>
                              </div>
                            </Label>

                            <Label className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                              <RadioGroupItem
                                className="sr-only"
                                value="do-not-transcribe"
                              />
                              <div className="flex w-full items-center gap-3">
                                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary">
                                  {field.value === "do-not-transcribe" && (
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                  )}
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-sm">
                                    Do Not Transcribe
                                  </span>
                                  <span className="font-normal text-muted-foreground text-xs">
                                    Audio will not be stored or processed.
                                  </span>
                                </div>
                              </div>
                            </Label>
                          </RadioGroup>
                        )}
                      />
                    </div>
                  </CardContent>
                </div>
              )}

              {/* ── Step 5: Review & Submit ──────────────────────────────────── */}
              {currentStep === 5 && (
                <div className="slide-in-from-left-4 fade-in animate-in duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Additional Notes & Review
                    </CardTitle>
                    <CardDescription>
                      Finalize your configuration before publishing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label
                        className="font-semibold text-foreground"
                        htmlFor="notes"
                      >
                        Other Notes
                      </Label>
                      <Textarea
                        className="min-h-[120px] resize-y"
                        id="notes"
                        placeholder="Add any additional instructions for recruiters or stakeholders here..."
                        {...register("notes")}
                      />
                      <p className="text-muted-foreground text-sm">
                        Optional internal notes for the project.
                      </p>
                    </div>

                    {/* Survey summary */}
                    <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <h4 className="font-semibold text-foreground text-sm">
                        Screening Survey
                      </h4>
                      {surveyQuestions.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          No survey questions added — participants will not be
                          screened.
                        </p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-sm">
                            <span className="font-medium text-foreground">
                              {surveyQuestions.length}
                            </span>{" "}
                            question{surveyQuestions.length !== 1 ? "s" : ""}{" "}
                            added
                            {surveyRules.length > 0 && (
                              <>
                                ,{" "}
                                <span className="font-medium text-foreground">
                                  {surveyRules.length}
                                </span>{" "}
                                screening rule
                                {surveyRules.length !== 1 ? "s" : ""} configured
                              </>
                            )}
                            .
                          </p>
                          <ul className="mt-2 list-disc space-y-0.5 pl-4 text-muted-foreground text-xs">
                            {surveyQuestions.slice(0, 5).map((q, i) => (
                              <li key={q.id}>
                                {q.question || `Question ${i + 1} (untitled)`}
                              </li>
                            ))}
                            {surveyQuestions.length > 5 && (
                              <li className="text-muted-foreground/70">
                                …and {surveyQuestions.length - 5} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <h4 className="font-semibold text-foreground text-sm">
                        Review Requirements
                      </h4>
                      <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-sm">
                        <li>
                          Ensure participant sample sizes accurately match your
                          budget.
                        </li>
                        <li>Double check recruitment deadlines.</li>
                        <li>
                          Check if Salesforce billing details correctly map.
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </div>
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
