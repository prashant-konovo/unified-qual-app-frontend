// TODO: Replace mock data with API integration — see lib/api/*.ts
import type { Survey } from "./types";

export const MOCK_SURVEY: Survey = {
  id: "survey_001",
  projectId: "proj_123",
  projectName: "Apollo Qual Study",
  title: "Apollo Qual Study",
  crowdId: "crowd_456",
  crowdName: "Product Managers — US",
  status: "draft",
  questions: [
    {
      id: "q1",
      type: "single_choice",
      question: "Are you currently working as a Product Manager?",
      description: "We are looking for active Product Managers only.",
      required: true,
      options: ["Yes, full-time", "Yes, part-time", "No"],
    },
    {
      id: "q2",
      type: "number",
      question: "How many years of experience do you have as a PM?",
      required: true,
    },
    {
      id: "q3",
      type: "multiple_choice",
      question: "Which areas do you specialize in?",
      required: false,
      options: [
        "B2B SaaS",
        "Consumer Apps",
        "Platform / Infrastructure",
        "AI / ML",
        "Enterprise",
      ],
    },
    {
      id: "q4",
      type: "short_text",
      question: "What company do you currently work at?",
      required: true,
    },
    {
      id: "q5",
      type: "rating",
      question: "How familiar are you with qualitative research methods?",
      required: false,
      ratingMax: 5,
    },
  ],
  rules: [
    {
      id: "r1",
      questionId: "q1",
      condition: "equals",
      value: "No",
      action: "disqualify",
    },
    {
      id: "r2",
      questionId: "q2",
      condition: "less_than",
      value: "2",
      action: "disqualify",
    },
  ],
};
