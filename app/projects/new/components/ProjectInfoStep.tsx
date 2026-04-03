"use client";

import { Video } from "lucide-react";
import { Controller } from "react-hook-form";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectInfoStepProps } from "./types";

export function ProjectInfoStep({
  register,
  control,
  errors,
  availableSubscriptions,
  isLoadingSubscriptions,
}: ProjectInfoStepProps) {
  return (
    <div className="slide-in-from-left-4 fade-in animate-in duration-300">
      <CardHeader>
        <CardTitle className="text-xl">Project Information</CardTitle>
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
            <p className="text-red-500 text-sm">{errors.projectName.message}</p>
          ) : (
            <p className="text-muted-foreground text-sm">
              Name used internally to identify this research project.
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
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={errors.interviewLength ? "border-red-500" : ""}
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
            Salesforce Job Number
          </Label>
          <Input
            id="salesforceProject"
            placeholder="e.g. SF-JOB-12345"
            {...register("salesforceProject")}
            className={
              errors.salesforceProject
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }
          />
          {errors.salesforceProject ? (
            <p className="text-red-500 text-sm">
              {errors.salesforceProject.message}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              Enter the Salesforce job number for billing.
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
              <Select onValueChange={field.onChange} value={field.value}>
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
            Optionally attach this project to a master subscription record.
          </p>
        </div>

        {/* Conference Link */}
        <div className="space-y-2">
          <Label className="font-semibold text-foreground">
            Conference Platform
          </Label>
          <p className="text-muted-foreground text-sm">
            Choose the video platform moderators will use for interviews.
          </p>
          <Controller
            control={control}
            name="conferenceType"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="google_meet">Google Meet</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="custom">Custom / Other</SelectItem>
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
                    className={errors.conferenceLink ? "border-red-500" : ""}
                  />
                  {errors.conferenceLink ? (
                    <p className="text-red-500 text-sm">
                      {errors.conferenceLink.message}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      This link will be shared with moderators and included in
                      participant interview confirmations.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        />
      </CardContent>
    </div>
  );
}
