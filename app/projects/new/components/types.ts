import type {
  Control,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
} from "react-hook-form";
import type { z } from "zod";
import type {
  ScreeningRule,
  Survey,
  SurveyQuestion,
} from "@/app/survey-builder/types";
import type { formSchema } from "./schema";

export type FormValues = z.infer<typeof formSchema>;

/** Common props shared by steps that use react-hook-form */
export interface FormStepProps {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  register: UseFormRegister<FormValues>;
}

/** Step 1 – Project Information */
export interface ProjectInfoStepProps extends FormStepProps {
  availableSubscriptions: any[];
  isLoadingSubscriptions: boolean;
}

/** Step 2 – Participant Groups */
export interface ParticipantGroupsStepProps extends FormStepProps {
  append: UseFieldArrayAppend<FormValues, "participantGroups">;
  fields: { id: string }[];
  remove: UseFieldArrayRemove;
}

/** Step 3 – Survey Builder */
export interface SurveyStepProps {
  availableSurveys: Survey[];
  isLoadingSurveys: boolean;
  linkedSurveyId: string;
  setLinkedSurveyId: (id: string) => void;
  setSurveyMode: (mode: "create" | "attach") => void;
  setSurveyQuestions: React.Dispatch<React.SetStateAction<SurveyQuestion[]>>;
  setSurveyRules: React.Dispatch<React.SetStateAction<ScreeningRule[]>>;
  surveyMode: "create" | "attach";
  surveyQuestions: SurveyQuestion[];
  surveyRules: ScreeningRule[];
}

/** Step 4 – Timeline & Settings */
export type TimelineSettingsStepProps = FormStepProps;

/** Step 5 – Review & Submit */
export interface ReviewStepProps extends FormStepProps {
  surveyQuestions: SurveyQuestion[];
  surveyRules: ScreeningRule[];
}
