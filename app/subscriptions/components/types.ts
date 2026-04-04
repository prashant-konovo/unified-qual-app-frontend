import { z } from "zod";

export const subscriptionFormSchema = z.object({
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

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;
