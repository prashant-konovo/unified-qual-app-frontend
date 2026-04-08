import apiClient from "../axios";

export type ServiceCategory = "LS" | "MRA";
export type ProjectSource = "qs" | "iris";

// API response shape from GET /v1/projects
export interface ProjectListItem {
  id: number;
  name: string;
  status: string;
  statusId: number;
  source: ProjectSource;
  serviceCategory: ServiceCategory;
  createdAt: string;
  modifiedAt: string | null;
  // IRIS (MRA) fields
  description?: string | null;
  subscriptionId?: number;
  subscriptionCompany?: string | null;
  projectTypeId?: number;
  salesforceProjectId?: string | null;
  isArchived?: boolean;
  // QS (LS) fields
  salesforceJobNumber?: string | null;
  clientId?: number | null;
  clientCompany?: string | null;
  sampleSize?: number | null;
  interviewLength?: number | null;
  scheduledCount?: number;
  completedCount?: number;
}

// API response shape from GET /v1/project/{id}
export interface ProjectDetail extends ProjectListItem {
  // QS (LS) detail fields
  externalSurveyId?: string | null;
  schedulerGenerated?: boolean;
  postScreeninBuffer?: string | null;
  moderatorBuffer?: string | null;
  topics?: string[];
  // IRIS (MRA) detail fields
  isPrivate?: boolean;
}

export interface ProjectPayload {
  name: string;
  source?: ProjectSource;
  serviceCategory?: ServiceCategory;
  description?: string;
  subscriptionId?: number | string;
  salesforceProjectId?: string;
  salesforceJobNumber?: string;
  sampleSize?: number;
  interviewLength?: number;
  clientId?: number;
  postScreeninBuffer?: number;
  moderatorBuffer?: number;
  [key: string]: unknown;
}

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  serviceCategory?: ServiceCategory;
  source?: ProjectSource;
  statusId?: number;
}

export const projectsApi = {
  getProjectsList: async (
    params?: ProjectListParams
  ): Promise<ProjectListItem[]> => {
    const response = await apiClient.get("/projects", { params });
    const body = response.data;
    // API returns { success, data, meta }
    return Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
  },

  getProject: async (
    id: string | number,
    source?: ProjectSource
  ): Promise<ProjectDetail | null> => {
    const params = source ? { source } : {};
    const response = await apiClient.get(`/project/${id}`, { params });
    const body = response.data;
    return body?.data ?? body ?? null;
  },

  createProject: async (data: ProjectPayload) => {
    const response = await apiClient.post("/project", data);
    return response.data?.data ?? response.data;
  },

  updateProject: async (id: string | number, data: Partial<ProjectPayload>) => {
    const response = await apiClient.put(`/project/${id}`, data);
    return response.data?.data ?? response.data;
  },

  deleteProject: async (id: string | number) => {
    const response = await apiClient.delete(`/project/${id}`);
    return response.data?.data ?? response.data;
  },
};
