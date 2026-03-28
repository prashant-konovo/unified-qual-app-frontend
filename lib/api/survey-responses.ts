import type { ScreeningRule, SurveyQuestion } from "@/app/survey-builder/types";
import apiClient from "../axios";

export interface PublicSurvey {
  id: string;
  projectId: string;
  projectName: string;
  questions: SurveyQuestion[];
  rules: ScreeningRule[];
}

export interface SurveyResponsePayload {
  answers: Record<string, string | string[] | number>;
  projectId: string;
  surveyId: string;
  userId: string;
}

export interface SurveyResponse {
  id: string;
  projectId: string;
  status: "qualified" | "disqualified" | "pending";
  submittedAt?: string;
  userId: string;
}

export const surveyResponsesApi = {
  getPublicSurvey: async (surveyId: string): Promise<PublicSurvey> => {
    const response = await apiClient.get(`/survey/${surveyId}/public`);
    return response.data;
  },

  getExistingResponse: async (
    userId: string,
    projectId: string
  ): Promise<SurveyResponse | null> => {
    try {
      const response = await apiClient.get(`/survey-responses/${userId}`, {
        params: { projectId },
      });
      const items: SurveyResponse[] = response.data;
      const match = items.find((r) => r.projectId === projectId);
      return match ?? null;
    } catch {
      return null;
    }
  },

  submitResponse: async (
    payload: SurveyResponsePayload
  ): Promise<SurveyResponse> => {
    const response = await apiClient.post("/survey-responses", payload);
    return response.data;
  },
};
