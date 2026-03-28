"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const TIMEZONES = [
  { label: "UTC", value: "UTC" },
  { label: "Eastern Time (ET)", value: "America/New_York" },
  { label: "Central Time (CT)", value: "America/Chicago" },
  { label: "Mountain Time (MT)", value: "America/Denver" },
  { label: "Pacific Time (PT)", value: "America/Los_Angeles" },
  { label: "London (GMT)", value: "Europe/London" },
  { label: "Central Europe (CET)", value: "Europe/Paris" },
  { label: "India (IST)", value: "Asia/Kolkata" },
  { label: "Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Japan (JST)", value: "Asia/Tokyo" },
  { label: "Australia Eastern (AEST)", value: "Australia/Sydney" },
];

const schema = z.object({
  preferredDays: z.array(z.string()).min(1, "Select at least one day"),
  preferredEnd: z.string().min(1, "Required"),
  preferredStart: z.string().min(1, "Required"),
  timezone: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

interface PreferredTimeFormProps {
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (values: FormValues) => void;
}

export function PreferredTimeForm({
  isSubmitting,
  onBack,
  onSubmit,
}: PreferredTimeFormProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      preferredDays: [],
      preferredEnd: "",
      preferredStart: "",
      timezone: "UTC",
    },
    resolver: zodResolver(schema),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Tell us your availability</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          We'll notify you as soon as a slot opens that matches your preferred
          time.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Days */}
          <FormField
            control={form.control}
            name="preferredDays"
            render={() => (
              <FormItem>
                <FormLabel>Preferred Days</FormLabel>
                <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DAYS.map((day) => (
                    <FormField
                      control={form.control}
                      key={day}
                      name="preferredDays"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value.includes(day)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, day]);
                                } else {
                                  field.onChange(
                                    field.value.filter((d) => d !== day)
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer font-normal text-sm">
                            {day}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="preferredStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Timezone */}
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Timezone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-2">
            <Button
              disabled={isSubmitting}
              onClick={onBack}
              type="button"
              variant="outline"
            >
              Back to Slots
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Availability
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
