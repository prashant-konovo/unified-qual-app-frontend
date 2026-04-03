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

export interface ContactsStepProps {
  form: UseFormReturn<SubscriptionFormValues>;
}

export function ContactsStep({ form }: ContactsStepProps) {
  return (
    <div className="space-y-4">
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
  );
}
