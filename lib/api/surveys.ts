import type { Survey } from "@/app/survey-builder/types";
import apiClient from "../axios";

export const surveysApi = {
  /**
   * Fetch the list of all surveys
   * GET /v1/surveys
   */
  getSurveysList: async (): Promise<Survey[]> => {
    const response = await apiClient.get("/surveys");
    return response.data;
  },

  /**
   * Create a new survey
   * POST /v1/survey
   */
  createSurvey: async (data: Partial<Survey>) => {
    const response = await apiClient.post("/survey", data);
    return response.data;
  },

  /**
   * Update an existing survey
   * PUT /v1/survey/{id}
   */
  updateSurvey: async (id: string, data: Partial<Survey>) => {
    const response = await apiClient.put(`/survey/${id}`, data);
    return response.data;
  },

  /**
   * Delete an existing survey
   * DELETE /v1/survey/{id}
   */
  deleteSurvey: async (id: string) => {
    const response = await apiClient.delete(`/survey/${id}`);
    return response.data;
  },
};
