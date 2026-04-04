import { z } from "zod";

export const crowdFormSchema = z.object({
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

export type CrowdFormValues = z.infer<typeof crowdFormSchema>;
