"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  // Step 1
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  subscription: z.string().min(1, "Subscription required"),
  type: z.enum(["Profile", "Custom", "Employee"]),
  // Step 2
  country: z.string().min(1, "Country required"),
  professions: z.string().min(1, "Profession required"),
  specialties: z.string().min(1, "Specialty required"),
  panels: z.string().min(1, "Panel required"),
  // Step 3 (Dynamic Attributes)
  attributes: z
    .array(
      z.object({
        name: z.string().min(1, "Attribute name required"),
        choices: z.string().min(1, "Choices required (comma separated)"),
      })
    )
    .optional(),
});

const steps = [
  { title: "Basic Info" },
  { title: "Targeting" },
  { title: "Attributes" },
  { title: "Review" },
];

export function CreateCrowdWizard() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
  const { fields, append, remove } = useFieldArray({
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

  function onSubmit(values: z.infer<typeof formSchema>) {
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
              {/* STEP 1: Basic Info */}
              <div className={`space-y-4 ${currentStep !== 0 ? "hidden" : ""}`}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crowd Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Millennial Retail Shoppers"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subscription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Subscription" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="acme">
                              Acme Global (Enterprise)
                            </SelectItem>
                            <SelectItem value="globex">
                              Globex EU (Growth)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crowd Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Profile">Profile</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                            <SelectItem value="Employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-none"
                          placeholder="Brief note about the demographic criteria..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* STEP 2: Targeting */}
              <div className={`space-y-4 ${currentStep !== 1 ? "hidden" : ""}`}>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="gb">United Kingdom</SelectItem>
                            <SelectItem value="eu">European Union</SelectItem>
                            <SelectItem value="global">Global (Any)</SelectItem>
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
                        <FormLabel>Provider Panel</FormLabel>
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
                            <SelectItem value="consumer">
                              Consumer Panel
                            </SelectItem>
                            <SelectItem value="tech">Tech Base</SelectItem>
                            <SelectItem value="b2b">B2B Network</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="professions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession Filter</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Profession" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="any">Any Profession</SelectItem>
                            <SelectItem value="software">
                              Software Engineering
                            </SelectItem>
                            <SelectItem value="marketing">
                              Marketing & Sales
                            </SelectItem>
                            <SelectItem value="healthcare">
                              Healthcare Provider
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialty</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Specialty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="any">Any Specialty</SelectItem>
                            <SelectItem value="frontend">
                              Frontend Development
                            </SelectItem>
                            <SelectItem value="pediatrics">
                              Pediatrics
                            </SelectItem>
                            <SelectItem value="b2b_sales">
                              Enterprise B2B Sales
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* STEP 3: Attributes (Dynamic useFieldArray) */}
              <div className={`space-y-4 ${currentStep !== 2 ? "hidden" : ""}`}>
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h4 className="font-medium text-sm">
                      Targeting Attributes
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Add dynamic screening constraints
                    </p>
                  </div>
                  <Button
                    onClick={() => append({ name: "", choices: "" })}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Attribute
                  </Button>
                </div>

                {fields.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      No target attributes configured.
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  {fields.map((field, index) => (
                    <div
                      className="fade-in slide-in-from-top-2 flex animate-in items-start gap-3 rounded-lg border bg-card p-3 shadow-sm"
                      key={field.id}
                    >
                      <FormField
                        control={form.control}
                        name={`attributes.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-1">
                            <FormLabel className="font-semibold text-xs">
                              Attribute
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-9"
                                placeholder="e.g. Budget Authority"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`attributes.${index}.choices`}
                        render={({ field }) => (
                          <FormItem className="flex-[2] space-y-1">
                            <FormLabel className="font-semibold text-xs">
                              Criteria/Choices (comma separated)
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-9"
                                placeholder="e.g. Yes, Approver Only"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                      <Button
                        className="mt-6 h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 4: Review */}
              <div className={`space-y-6 ${currentStep !== 3 ? "hidden" : ""}`}>
                <div className="space-y-4 rounded-lg border bg-muted/10 p-5">
                  <h4 className="border-b pb-2 font-semibold text-sm">
                    Basic Info
                  </h4>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="mb-1 block text-muted-foreground text-xs uppercase tracking-wider">
                        Name
                      </span>
                      <span className="font-medium">
                        {form.getValues("name") || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="mb-1 block text-muted-foreground text-xs uppercase tracking-wider">
                        Subscription
                      </span>
                      <span className="font-medium capitalize">
                        {form.getValues("subscription") || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="mb-1 block text-muted-foreground text-xs uppercase tracking-wider">
                        Type
                      </span>
                      <span className="font-medium">
                        {form.getValues("type")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border bg-muted/10 p-5">
                  <h4 className="border-b pb-2 font-semibold text-sm">
                    Targeting Filters
                  </h4>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="mb-1 block text-muted-foreground text-xs uppercase tracking-wider">
                        Country
                      </span>
                      <span className="font-medium capitalize">
                        {form.getValues("country") || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="mb-1 block text-muted-foreground text-xs uppercase tracking-wider">
                        Panel
                      </span>
                      <span className="font-medium capitalize">
                        {form.getValues("panels") || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {(form.getValues("attributes")?.length ?? 0) > 0 && (
                    <div className="space-y-4 rounded-lg border bg-muted/10 p-5">
                      <h4 className="flex justify-between border-b pb-2 font-semibold text-sm">
                        <span>Dynamic Attributes</span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs">
                          {form.getValues("attributes")?.length}
                        </span>
                      </h4>
                      <ul className="mt-3 space-y-3 text-sm">
                        {form.getValues("attributes")?.map((attr, i) => (
                          <li
                            className="flex items-start gap-4 rounded-md border bg-background p-2"
                            key={i}
                          >
                            <span
                              className="w-[140px] truncate font-medium text-xs uppercase tracking-wider"
                              title={attr.name}
                            >
                              {attr.name || "UNNAMED"}
                            </span>
                            <span className="flex-1 break-words text-muted-foreground">
                              {attr.choices || "—"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
