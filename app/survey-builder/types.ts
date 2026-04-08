export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "number"
  | "rating";

export interface SurveyQuestion {
  description?: string;
  id: string;
  options?: string[]; // for single_choice, multiple_choice, dropdown
  question: string;
  ratingMax?: number; // for rating questions, default 5
  required: boolean;
  type: QuestionType;
}

export interface ScreeningRule {
  action: "qualify" | "disqualify";
  condition:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than";
  id: string;
  questionId: string;
  value: string;
}

export interface Survey {
  crowdId: string;
  crowdName: string;
  id: string;
  projectId: string;
  projectName: string;
  questions: SurveyQuestion[];
  rules: ScreeningRule[];
  status: "draft" | "published";
  title: string;
}

export const QUESTION_TYPE_META: Record<
  QuestionType,
  { label: string; description: string; icon: string }
> = {
  short_text: {
    label: "Short Text",
    description: "A single line text response",
    icon: "Type",
  },
  long_text: {
    label: "Long Text",
    description: "A multi-line text response",
    icon: "AlignLeft",
  },
  single_choice: {
    label: "Single Choice",
    description: "Participant picks one option",
    icon: "CircleDot",
  },
  multiple_choice: {
    label: "Multiple Choice",
    description: "Participant picks multiple options",
    icon: "CheckSquare",
  },
  dropdown: {
    label: "Dropdown",
    description: "Pick from a dropdown list",
    icon: "ChevronDown",
  },
  number: {
    label: "Number",
    description: "A numerical response",
    icon: "Hash",
  },
  rating: {
    label: "Rating Scale",
    description: "A 1–5 (or 1–10) rating scale",
    icon: "Star",
  },
};

export const CONDITION_LABELS: Record<ScreeningRule["condition"], string> = {
  equals: "equals",
  not_equals: "not equals",
  contains: "contains",
  greater_than: "greater than",
  less_than: "less than",
};
