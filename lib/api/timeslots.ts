import apiClient from "../axios";

export interface Timeslot {
  createdAt?: string;
  end: string;
  id: string;
  meetingLink?: string;
  moderatorId: string;
  moderatorName: string;
  participant?: string;
  project?: string;
  projectId?: string;
  start: string; // "YYYY-MM-DDTHH:mm"
  timezone?: string;
  type: "availability" | "interview";
  updatedAt?: string;
}

export type CreateTimeslotPayload = Omit<
  Timeslot,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateTimeslotPayload = Partial<
  Omit<Timeslot, "id" | "createdAt" | "updatedAt">
>;

export interface TimeslotsFilter {
  /** YYYY-MM-DD inclusive lower bound on start */
  from?: string;
  moderatorId?: string;
  /** YYYY-MM-DD inclusive upper bound on start */
  to?: string;
  type?: string;
}

export interface InterviewSlot {
  capacity: number;
  end: string;
  id: string;
  moderatorId: string;
  moderatorName?: string;
  projectId: string;
  start: string;
}

export interface GenerateSlotsPayload {
  availabilityEnd: string;
  availabilityStart: string;
  interviewLengthMinutes: number;
  moderatorId: string;
  projectId: string;
}

export interface SlotsFilter {
  from?: string;
  projectId?: string;
  to?: string;
}

export interface AISuggestedSlot {
  participantCount: number;
  suggestedEnd: string;
  suggestedStart: string;
}

export interface AISuggestionsResponse {
  projectId: string;
  suggestions: AISuggestedSlot[];
}

export const timeslotsApi = {
  getTimeslots: async (params: TimeslotsFilter = {}): Promise<Timeslot[]> => {
    const response = await apiClient.get("/timeslots", { params });
    return response.data;
  },

  createTimeslot: async (data: CreateTimeslotPayload): Promise<Timeslot> => {
    const response = await apiClient.post("/timeslots", data);
    return response.data;
  },

  getTimeslot: async (id: string): Promise<Timeslot> => {
    const response = await apiClient.get(`/timeslots/${id}`);
    return response.data;
  },

  updateTimeslot: async (
    id: string,
    data: UpdateTimeslotPayload
  ): Promise<Timeslot> => {
    const response = await apiClient.put(`/timeslots/${id}`, data);
    return response.data;
  },

  deleteTimeslot: async (id: string): Promise<void> => {
    await apiClient.delete(`/timeslots/${id}`);
  },

  getModeratorTimeslots: async (
    moderatorId: string,
    params: Omit<TimeslotsFilter, "moderatorId"> = {}
  ): Promise<Timeslot[]> => {
    const response = await apiClient.get(
      `/moderators/${moderatorId}/timeslots`,
      { params }
    );
    return response.data;
  },

  generateSlots: async (
    payload: GenerateSlotsPayload
  ): Promise<InterviewSlot[]> => {
    const response = await apiClient.post("/slots/generate", payload);
    return response.data;
  },

  getAvailableSlots: async (
    params: SlotsFilter = {}
  ): Promise<InterviewSlot[]> => {
    const response = await apiClient.get("/slots", { params });
    return response.data;
  },

  getAISuggestions: async (
    projectId: string
  ): Promise<AISuggestionsResponse> => {
    const response = await apiClient.get("/ai/suggested-slots", {
      params: { projectId },
    });
    return response.data;
  },
};
