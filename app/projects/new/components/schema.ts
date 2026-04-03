import { z } from "zod";

export const formSchema = z.object({
  // Step 1
  projectName: z.string().min(2, "Project name is required"),
  interviewLength: z.string().min(1, "Please select an interview length"),
  salesforceProject: z.string().min(1, "Please select a Salesforce project"),
  subscriptionId: z.string().optional(),
  conferenceType: z.enum(["zoom", "google_meet", "teams", "custom", "none"]),
  conferenceLink: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  // Step 2 (Dynamic Fields)
  participantGroups: z
    .array(
      z.object({
        crowdName: z.string().min(1, "Crowd name is required"),
        profession: z.string().min(1, "Profession is required"),
        sampleSize: z.number().min(1, "Sample size must be at least 1"),
      })
    )
    .min(1, "At least one participant group is required"),

  // Step 4
  recruitmentDate: z.string().min(1, "Please select a recruitment date"),
  enableStimulusSharing: z.boolean(),
  transcription: z.enum(["transcribe", "do-not-transcribe"]),

  // Step 5
  notes: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export const steps = [
  { id: 1, name: "Project Information" },
  { id: 2, name: "Participant Groups" },
  { id: 3, name: "Survey Builder" },
  { id: 4, name: "Timeline & Settings" },
  { id: 5, name: "Review & Submit" },
];

export function getFieldsForStep(step: number): any {
  switch (step) {
    case 1:
      return ["projectName", "interviewLength", "salesforceProject"];
    case 2:
      return ["participantGroups"];
    case 3:
      return [];
    case 4:
      return ["recruitmentDate", "enableStimulusSharing", "transcription"];
    default:
      return undefined;
  }
}
