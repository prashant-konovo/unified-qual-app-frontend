"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { projectsApi } from "@/lib/api/projects";
import { subscriptionsApi } from "@/lib/api/subscriptions";

import {
  SubscriptionBasicInfoStep,
  SubscriptionSalesforceMarketsStep,
  SubscriptionContactsStep,
  SubscriptionConfigurationStep,
  SubscriptionReviewStep,
} from "./steps";
import { subscriptionFormSchema, SubscriptionFormValues } from "./types";

const steps = [
  { title: "Basic Info" },
  { title: "Salesforce & Markets" },
  { title: "Contacts" },
  { title: "Configuration" },
  { title: "Review" },
];

export function CreateSubscriptionWizard() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);

  // Fetch projects to allow attaching multiple projects
  useEffect(() => {
    if (open) {
      projectsApi
        .getProjectsList()
        .then((data) => {
          if (Array.isArray(data)) {
            setAvailableProjects(data);
          }
        })
        .catch(console.error);
    }
  }, [open]);

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      company: "",
      shortCode: "",
      plan: "",
      currency: "",
      phone: "",
      salesforceAccount: "",
      markets: "",
      panels: "",
      csUser: "",
      salesContact: "",
      pmContact: "",
      serviceType: "",
      businessType: "",
      aeReporting: "",
      aeConsent: false,
      skipSfValidation: false,
      projectIds: [],
    },
    mode: "onChange",
  });

  // Validate fields for the current step before allowing next
  const handleNext = async () => {
    let fieldsToValidate: any[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ["company", "shortCode", "plan", "currency", "phone"];
    }
    if (currentStep === 1) {
      fieldsToValidate = ["salesforceAccount", "markets", "panels"];
    }
    if (currentStep === 2) {
      fieldsToValidate = ["csUser", "salesContact", "pmContact"];
    }
    if (currentStep === 3) {
      fieldsToValidate = ["serviceType", "businessType", "aeReporting"];
    }

    // Attempt validation
    const isStepValid = await form.trigger(fieldsToValidate);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  async function onSubmit(values: SubscriptionFormValues) {
    setIsSubmitting(true);
    try {
      await subscriptionsApi.createSubscription(values);
      setOpen(false);
      form.reset();
      setCurrentStep(0);
      toast.success("Subscription created successfully!");
    } catch (error) {
      console.error("Failed to create subscription:", error);
      toast.error("Failed to create subscription");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-6 overflow-hidden sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Subscription</DialogTitle>
          <DialogDescription>
            Add a new client subscription to HalaQual.
          </DialogDescription>
        </DialogHeader>

        <div className="relative py-4 pb-8">
          <Stepper currentStep={currentStep} steps={steps} />
        </div>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col gap-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="min-h-[200px] flex-1 overflow-y-auto pr-1">
              <div className={currentStep !== 0 ? "hidden" : ""}>
                <SubscriptionBasicInfoStep form={form} />
              </div>
              <div className={currentStep !== 1 ? "hidden" : ""}>
                <SubscriptionSalesforceMarketsStep form={form} />
              </div>
              <div className={currentStep !== 2 ? "hidden" : ""}>
                <SubscriptionContactsStep form={form} />
              </div>
              <div className={currentStep !== 3 ? "hidden" : ""}>
                <SubscriptionConfigurationStep availableProjects={availableProjects} form={form} />
              </div>
              <div className={currentStep !== 4 ? "hidden" : ""}>
                <SubscriptionReviewStep form={form} />
              </div>
            </div>

            <DialogFooter className="flex w-full sm:justify-between sm:space-x-0">
              <Button
                disabled={currentStep === 0 || isSubmitting}
                onClick={handlePrevious}
                type="button"
                variant="outline"
              >
                Back
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Creating..." : "Create Subscription"}
                </Button>
              ) : (
                <Button onClick={handleNext} type="button">
                  Continue
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
