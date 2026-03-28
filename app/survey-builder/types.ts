export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "number"
  | "rating";

export type SurveyQuestion = {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  required: boolean;
  options?: string[]; // for single_choice, multiple_choice, dropdown
  ratingMax?: number; // for rating questions, default 5
};

export type ScreeningRule = {
  id: string;
  questionId: string;
  condition:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than";
  value: string;
  action: "qualify" | "disqualify";
};

export type Survey = {
  id: string;
  projectId: string;
  projectName: string;
  crowdId: string;
  crowdName: string;
  status: "draft" | "published";
  questions: SurveyQuestion[];
  rules: ScreeningRule[];
};

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
