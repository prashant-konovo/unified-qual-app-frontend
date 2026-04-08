"use client";

import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
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

import { CrowdFormValues } from "../types";

export interface CrowdTargetingStepProps {
  form: UseFormReturn<CrowdFormValues>;
}

export function CrowdTargetingStep({ form }: CrowdTargetingStepProps) {
  return (
    <div className="space-y-4">
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
  );
}
