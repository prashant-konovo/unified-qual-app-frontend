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

import { SubscriptionFormValues } from "../types";

export interface SalesforceMarketsStepProps {
  form: UseFormReturn<SubscriptionFormValues>;
}

export function SalesforceMarketsStep({ form }: SalesforceMarketsStepProps) {
  return (
    <div className="space-y-4">
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
  );
}
