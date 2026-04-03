"use client";

import { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SubscriptionFormValues } from "../types";

export interface ConfigurationStepProps {
  form: UseFormReturn<SubscriptionFormValues>;
  availableProjects: any[];
}

export function ConfigurationStep({ form, availableProjects }: ConfigurationStepProps) {
  return (
    <div className="space-y-4">
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
  );
}
