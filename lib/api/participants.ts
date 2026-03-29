import apiClient from "../axios";

export interface Participant {
  createdAt?: string;
  email: string;
  id: string;
  name: string;
  phone?: string;
  role: "participant";
  status: "active" | "inactive";
  updatedAt?: string;
}

export type SurveyResponseStatus = "qualified" | "disqualified" | "pending";
export type InterviewBookingStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";
export type WaitingStatus = "waiting" | "matched" | "expired";

export interface SurveyResponse {
  answers: Record<string, string | string[]>;
  id: string;
  projectId: string;
  status: SurveyResponseStatus;
  submittedAt?: string;
  userId: string;
}

export interface InterviewBooking {
  createdAt?: string;
  id: string;
  meetingLink?: string;
  moderatorId: string;
  moderatorName: string;
  projectId: string;
  slotEnd: string;
  slotId: string;
  slotStart: string;
  status: InterviewBookingStatus;
  userId: string;
}

export interface WaitingQueueEntry {
  id: string;
  preferredDays: string[];
  preferredEnd: string;
  preferredStart: string;
  projectId: string;
  status: WaitingStatus;
  timezone: string;
  userId: string;
  waitingSince: string;
}

export interface ParticipantDetail extends Participant {
  booking?: InterviewBooking;
  surveyResponse?: SurveyResponse;
  waitingEntry?: WaitingQueueEntry;
}

export interface ParticipantsFilter {
  projectId?: string;
  status?: string;
}

// ── Response mapping helpers ──────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function unwrapList(body: any): any[] {
  return Array.isArray(body?.data)
    ? body.data
    : Array.isArray(body)
      ? body
      : [];
}

function unwrapOne(body: any): any {
  return body?.data ?? body;
}

function mapParticipant(raw: any): Participant {
  return {
    id: String(raw.id ?? ""),
    name:
      raw.name ??
      `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim() ||
      "",
    email: raw.email ?? "",
    phone: raw.phone,
    role: "participant",
    status: raw.status ?? "active",
    createdAt: raw.createdAt,
    updatedAt: raw.modifiedOn ?? raw.updatedAt,
  };
}

function mapParticipantDetail(raw: any): ParticipantDetail {
  return {
    ...mapParticipant(raw),
    booking: raw.booking,
    surveyResponse: raw.surveyResponse,
    waitingEntry: raw.waitingEntry,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── API ──────────────────────────────────────────────────────────────────────

export const participantsApi = {
  getParticipants: async (
    params: ParticipantsFilter = {}
  ): Promise<Participant[]> => {
    const response = await apiClient.get("/participants", { params });
    return unwrapList(response.data).map(mapParticipant);
  },

  getParticipant: async (id: string): Promise<ParticipantDetail> => {
    const response = await apiClient.get(`/participants/${id}`);
    return mapParticipantDetail(unwrapOne(response.data));
  },

  createParticipant: async (payload: {
    email: string;
    name: string;
    phone?: string;
    status?: "active" | "inactive";
  }): Promise<Participant> => {
    const response = await apiClient.post("/participants", payload);
    return mapParticipant(unwrapOne(response.data));
  },

  submitSurvey: async (payload: {
    answers: Record<string, string | string[]>;
    projectId: string;
    userId: string;
  }): Promise<SurveyResponse> => {
    const response = await apiClient.post("/survey/submit", payload);
    return response.data;
  },

  getSurveyResponse: async (userId: string): Promise<SurveyResponse[]> => {
    const response = await apiClient.get(`/survey/${userId}`);
    return response.data;
  },
};
