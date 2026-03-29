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

// ── Response mapping helpers ──────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function unwrapList(body: any): any[] {
  return Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
}

function unwrapOne(body: any): any {
  return body?.data ?? body;
}

function mapTimeslot(raw: any): Timeslot {
  return {
    id: String(raw.id ?? ""),
    start: raw.startTime ?? raw.start ?? "",
    end: raw.endTime ?? raw.end ?? "",
    moderatorId: String(raw.moderatorId ?? ""),
    moderatorName: raw.moderatorName ?? "",
    type:
      raw.type ??
      (raw.responderId || raw.responderName ? "interview" : "availability"),
    projectId: raw.projectId != null ? String(raw.projectId) : undefined,
    project: raw.projectName ?? raw.project,
    participant: raw.responderName ?? raw.participant,
    meetingLink: raw.meetingLink ?? raw.conferenceHash,
    timezone: raw.timezone,
    createdAt: raw.createdAt,
    updatedAt: raw.modifiedOn ?? raw.updatedAt,
  };
}

function mapInterviewSlot(raw: any): InterviewSlot {
  return {
    id: String(raw.id ?? ""),
    projectId: String(raw.projectId ?? ""),
    moderatorId: String(raw.moderatorId ?? ""),
    moderatorName: raw.moderatorName,
    start: raw.startTime ?? raw.start ?? "",
    end: raw.endTime ?? raw.end ?? "",
    capacity: raw.capacity ?? 1,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── API ──────────────────────────────────────────────────────────────────────

export const timeslotsApi = {
  getTimeslots: async (params: TimeslotsFilter = {}): Promise<Timeslot[]> => {
    const response = await apiClient.get("/timeslots", { params });
    return unwrapList(response.data).map(mapTimeslot);
  },

  createTimeslot: async (data: CreateTimeslotPayload): Promise<Timeslot> => {
    // Transform FE field names → BE field names
    const payload = {
      projectId: data.projectId ? Number(data.projectId) : undefined,
      startTime: data.start,
      endTime: data.end,
      moderatorId: data.moderatorId ? Number(data.moderatorId) : undefined,
      duration: 15,
    };
    const response = await apiClient.post("/timeslots", payload);
    return mapTimeslot(unwrapOne(response.data));
  },

  getTimeslot: async (id: string): Promise<Timeslot> => {
    const response = await apiClient.get(`/timeslots/${id}`);
    return mapTimeslot(unwrapOne(response.data));
  },

  updateTimeslot: async (
    id: string,
    data: UpdateTimeslotPayload
  ): Promise<Timeslot> => {
    // Transform FE field names → BE field names
    const payload: Record<string, unknown> = {};
    if (data.start) payload.startTime = data.start;
    if (data.end) payload.endTime = data.end;
    if (data.moderatorId) payload.moderatorId = Number(data.moderatorId);
    const response = await apiClient.put(`/timeslots/${id}`, payload);
    return mapTimeslot(unwrapOne(response.data));
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
    return unwrapList(response.data).map(mapTimeslot);
  },

  generateSlots: async (
    payload: GenerateSlotsPayload
  ): Promise<InterviewSlot[]> => {
    const response = await apiClient.post("/slots/generate", payload);
    return unwrapList(response.data).map(mapInterviewSlot);
  },

  getAvailableSlots: async (
    params: SlotsFilter = {}
  ): Promise<InterviewSlot[]> => {
    const response = await apiClient.get("/slots", { params });
    return unwrapList(response.data).map(mapInterviewSlot);
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
