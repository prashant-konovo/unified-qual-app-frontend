import apiClient from "../axios";

// Typing for your core project. Adjust fields as necessary for your schema!
export interface ProjectPayload {
  conferenceLink?: string;
  conferenceType?: string;
  enableStimulusSharing?: boolean;
  interviewLength?: string;
  name: string;
  notes?: string;
  owner?: string;
  participantGroups?: any[];
  recruitmentDate?: string;
  salesforceProject?: string;
  status?: string;
  surveyId?: string;
  transcription?: string;
  [key: string]: any;
}

export const projectsApi = {
  /**
   * Fetch the list of all custom projects
   * GET /v1/projects
   */
  getProjectsList: async () => {
    const response = await apiClient.get("/projects");
    return response.data;
  },

  /**
   * Fetch a single project by its ID
   * GET /v1/project/{id}
   */
  getProject: async (id: string) => {
    const response = await apiClient.get(`/project/${id}`);
    return response.data;
  },

  /**
   * Create a new project
   * POST /v1/project
   */
  createProject: async (data: ProjectPayload) => {
    const response = await apiClient.post("/project", data);
    return response.data;
  },

  /**
   * Update an existing project
   * PUT /v1/project/{id}
   */
  updateProject: async (id: string, data: Partial<ProjectPayload>) => {
    const response = await apiClient.put(`/project/${id}`, data);
    return response.data;
  },

  /**
   * Delete an existing project
   * DELETE /v1/project/{id}
   */
  deleteProject: async (id: string) => {
    const response = await apiClient.delete(`/project/${id}`);
    return response.data;
  },
};
