"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stepper } from "@/components/ui/stepper";
import { projectsApi } from "@/lib/api/projects";
import { subscriptionsApi } from "@/lib/api/subscriptions";

const formSchema = z.object({
  // Step 1
  company: z.string().min(2, "Company name is required"),
  shortCode: z.string().min(2).max(5),
  plan: z.string().min(1, "Plan is required"),
  currency: z.string().min(1, "Currency is required"),
  phone: z.string().min(1, "Phone is required"),
  // Step 2
  salesforceAccount: z.string().min(1, "Salesforce account required"),
  markets: z.string().min(1, "Market required"),
  panels: z.string().min(1, "Panel required"),
  // Step 3
  csUser: z.string().min(1, "CS User required"),
  salesContact: z.string().min(1, "Sales Contact required"),
  pmContact: z.string().min(1, "PM Contact required"),
  // Step 4
  serviceType: z.string().min(1, "Service type required"),
  businessType: z.string().min(1, "Business type required"),
  aeReporting: z.string().min(1, "AE Reporting required"),
  aeConsent: z.boolean(),
  skipSfValidation: z.boolean(),
  projectIds: z.array(z.string()).optional(),
});

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
              {/* STEP 1: Basic Info */}
              <div className={`space-y-4 ${currentStep !== 0 ? "hidden" : ""}`}>
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Code</FormLabel>
                      <FormControl>
                        <Input placeholder="ACM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Plan</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="enterprise">
                              Enterprise
                            </SelectItem>
                            <SelectItem value="growth">Growth</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="usd">USD</SelectItem>
                            <SelectItem value="eur">EUR</SelectItem>
                            <SelectItem value="gbp">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* STEP 2: Salesforce & Markets */}
              <div className={`space-y-4 ${currentStep !== 1 ? "hidden" : ""}`}>
                <FormField
                  control={form.control}
                  name="salesforceAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salesforce Account</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Salesforce Account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sf_acme">
                            Acme Global (001xxxxxxx1)
                          </SelectItem>
                          <SelectItem value="sf_globex">
                            Globex EU (001xxxxxxx2)
                          </SelectItem>
                          <SelectItem value="sf_initech">
                            Initech LLC (001xxxxxxx3)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="markets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Markets</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Market" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="eu">Europe</SelectItem>
                          <SelectItem value="global">Global</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="panels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Panels</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Panel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tech">
                            Healthcare & Tech
                          </SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="consumer">
                            Consumer Electronics
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* STEP 3: Contacts */}
              <div className={`space-y-4 ${currentStep !== 2 ? "hidden" : ""}`}>
                <FormField
                  control={form.control}
                  name="csUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Managing CS User</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select CS Contact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sarah">Sarah Jenkins</SelectItem>
                          <SelectItem value="tom">Tom Hanks</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salesContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Contact</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Sales Contact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mike">Mike Ross</SelectItem>
                          <SelectItem value="jane">Jane Doe</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pmContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PM Contact</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select PM Contact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="alex">Alex Vance</SelectItem>
                          <SelectItem value="chris">Chris Evans</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* STEP 4: Configuration */}
              <div className={`space-y-4 ${currentStep !== 3 ? "hidden" : ""}`}>
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Service Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Service Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full">Full Service</SelectItem>
                          <SelectItem value="self">Self Serve</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Business Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="b2b">B2B</SelectItem>
                          <SelectItem value="b2c">B2C</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aeReporting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AE Reporting Requirements</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select requirement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4 border-t pt-4">
                  <FormField
                    control={form.control}
                    name="aeConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Enable AE Consent Question</FormLabel>
                          <FormDescription>
                            Require consent before starting surveys.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skipSfValidation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Skip Salesforce validation</FormLabel>
                          <FormDescription>
                            Bypass SFDC sync checks for this subscription.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Multiple Projects Linking */}
                  <FormField
                    control={form.control}
                    name="projectIds"
                    render={() => (
                      <FormItem className="rounded-md border p-4 shadow-sm">
                        <div className="mb-4 space-y-1">
                          <FormLabel>Attach Projects</FormLabel>
                          <FormDescription>
                            Select multiple projects to map to this subscription
                          </FormDescription>
                        </div>
                        <div className="h-[150px] w-full overflow-y-auto rounded-md border">
                          <div className="space-y-4 p-4">
                            {availableProjects.length === 0 ? (
                              <p className="text-muted-foreground text-sm">
                                No projects found.
                              </p>
                            ) : (
                              availableProjects.map((project) => (
                                <FormField
                                  control={form.control}
                                  key={project.id}
                                  name="projectIds"
                                  render={({ field }) => {
                                    const projectsList = field.value || [];
                                    return (
                                      <FormItem
                                        className="flex flex-row items-center space-x-3 space-y-0"
                                        key={project.id}
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={projectsList.includes(
                                              project.id
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...projectsList,
                                                    project.id,
                                                  ])
                                                : field.onChange(
                                                    projectsList.filter(
                                                      (value) =>
                                                        value !== project.id
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="cursor-pointer font-normal">
                                          {project.name}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))
                            )}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* STEP 5: Review */}
              <div className={`space-y-4 ${currentStep !== 4 ? "hidden" : ""}`}>
                <h4 className="px-2 font-semibold">Summary</h4>
                <div className="space-y-3 rounded-md bg-muted/50 p-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Company:</span>
                    <span className="font-medium">
                      {form.getValues("company")} ({form.getValues("shortCode")}
                      )
                    </span>

                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium capitalize">
                      {form.getValues("plan") || "None"}
                    </span>

                    <span className="text-muted-foreground">Salesforce:</span>
                    <span className="font-medium">
                      {form.getValues("salesforceAccount")}
                    </span>

                    <span className="text-muted-foreground">Service Type:</span>
                    <span className="font-medium capitalize">
                      {form.getValues("serviceType")} -{" "}
                      {form.getValues("businessType")}
                    </span>
                  </div>
                </div>
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
