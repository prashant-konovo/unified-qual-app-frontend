import type { Survey } from "@/app/survey-builder/types";
import apiClient from "../axios";

/** Unwrap {success,data:[...]} or {data:[...]} or bare array */
function unwrapList(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (body?.data && Array.isArray(body.data)) return body.data;
  return [];
}

/** Unwrap {success,data:{...}} or {data:{...}} or bare object */
function unwrapOne(body: any): any {
  if (body?.data && typeof body.data === "object" && !Array.isArray(body.data))
    return body.data;
  return body;
}

function mapSurvey(raw: any): Survey {
  return {
    id: String(raw.id ?? ""),
    title: raw.title ?? "",
    projectId: String(raw.projectId ?? raw.project_id ?? ""),
    projectName: raw.projectName ?? raw.project_name ?? "",
    crowdId: raw.crowdId ?? raw.crowd_id ?? "",
    crowdName: raw.crowdName ?? raw.crowd_name ?? "",
    status: raw.status ?? "draft",
    questions: Array.isArray(raw.questions) ? raw.questions : [],
    rules: Array.isArray(raw.rules) ? raw.rules : [],
  };
}

export const surveysApi = {
  /**
   * Fetch the list of all surveys
   * GET /v1/surveys
   */
  getSurveysList: async (): Promise<Survey[]> => {
    const response = await apiClient.get("/surveys");
    return unwrapList(response.data).map(mapSurvey);
  },

  /**
   * Create a new survey
   * POST /v1/survey
   */
  createSurvey: async (data: Partial<Survey>) => {
    const response = await apiClient.post("/survey", data);
    return mapSurvey(unwrapOne(response.data));
  },

  /**
   * Update an existing survey
   * PUT /v1/survey/{id}
   */
  updateSurvey: async (id: string, data: Partial<Survey>) => {
    const response = await apiClient.put(`/survey/${id}`, data);
    return mapSurvey(unwrapOne(response.data));
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
