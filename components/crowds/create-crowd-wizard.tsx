"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Stepper } from "@/components/ui/stepper";

import {
  CrowdBasicInfoStep,
  TargetingStep,
  AttributesStep,
  CrowdReviewStep,
} from "./steps";
import { crowdFormSchema, CrowdFormValues } from "./types";

const steps = [
  { title: "Basic Info" },
  { title: "Targeting" },
  { title: "Attributes" },
  { title: "Review" },
];

export function CreateCrowdWizard() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<CrowdFormValues>({
    resolver: zodResolver(crowdFormSchema),
    defaultValues: {
      name: "",
      description: "",
      subscription: "",
      type: "Profile",
      country: "",
      professions: "",
      specialties: "",
      panels: "",
      attributes: [],
    },
    mode: "onChange",
  });

  // Hook for dynamic attribute fields
  const fieldArray = useFieldArray({
    control: form.control,
    name: "attributes",
  });

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ["name", "description", "subscription", "type"];
    }
    if (currentStep === 1) {
      fieldsToValidate = ["country", "professions", "specialties", "panels"];
    }
    if (currentStep === 2) {
      fieldsToValidate = ["attributes"];
    }

    const isStepValid = await form.trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  function onSubmit(values: CrowdFormValues) {
    console.log("Crowd Form Submitted:", values);
    setOpen(false);
    form.reset();
    setCurrentStep(0);
  }

  return (
    <Dialog
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setTimeout(() => {
            form.reset();
            setCurrentStep(0);
          }, 300);
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          <Plus className="mr-2 h-4 w-4" /> New Crowd
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-6 overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Crowd</DialogTitle>
          <DialogDescription>
            Target specific participant groups for your research sessions.
          </DialogDescription>
        </DialogHeader>

        <div className="relative border-b py-4 pb-8">
          <Stepper currentStep={currentStep} steps={steps} />
        </div>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="min-h-[350px]">
              <div className={currentStep !== 0 ? "hidden" : ""}>
                <CrowdBasicInfoStep form={form} />
              </div>
              <div className={currentStep !== 1 ? "hidden" : ""}>
                <TargetingStep form={form} />
              </div>
              <div className={currentStep !== 2 ? "hidden" : ""}>
                <AttributesStep fieldArray={fieldArray} form={form} />
              </div>
              <div className={currentStep !== 3 ? "hidden" : ""}>
                <CrowdReviewStep form={form} />
              </div>
            </div>

            <DialogFooter className="flex w-full pt-6 sm:justify-between sm:space-x-0">
              <Button
                className={currentStep === 0 ? "invisible" : ""}
                onClick={handlePrevious}
                type="button"
                variant="outline"
              >
                Back
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button type="submit">Complete & Create</Button>
              ) : (
                <Button onClick={handleNext} type="button">
                  {currentStep === steps.length - 2
                    ? "Review Summary"
                    : "Continue"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
