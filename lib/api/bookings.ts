import apiClient from "../axios";

export type BookingStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface Booking {
  createdAt?: string;
  id: string;
  meetingLink?: string;
  moderatorId: string;
  moderatorName: string;
  projectId: string;
  slotEnd: string;
  slotId: string;
  slotStart: string;
  status: BookingStatus;
  userId: string;
}

export interface EnrichedBooking {
  createdAt?: string;
  id: string;
  meetingLink?: string;
  moderatorId: string;
  moderatorName: string;
  participantName: string;
  projectId: string;
  projectName: string;
  rewardPoints: number;
  rewardStatus: string; // "credited" | "not_credited" | ""
  serviceCategory: string; // "LS" | "MRA"
  slotEnd: string;
  slotId: string;
  slotStart: string;
  status: BookingStatus;
  userId: string;
}

export interface CreateBookingPayload {
  projectId: string;
  slotId: string;
  userId: string;
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

function mapBookingStatus(raw: any): BookingStatus {
  const status = String(raw.status ?? "").toUpperCase();
  if (status === "COMPLETED") return "completed";
  if (status.includes("CANCEL")) return "cancelled";
  if (status.includes("NO_SHOW") || status.includes("NO SHOW"))
    return "no_show";
  return "scheduled";
}

function mapEnrichedBooking(raw: any): EnrichedBooking {
  return {
    id: String(raw.id ?? ""),
    slotId: String(raw.id ?? raw.slotId ?? ""),
    slotStart: raw.startTime ?? raw.slotStart ?? "",
    slotEnd: raw.endTime ?? raw.slotEnd ?? "",
    moderatorId: String(raw.moderatorId ?? ""),
    moderatorName: raw.moderatorName ?? "",
    participantName: raw.responderName ?? raw.participantName ?? "Unknown",
    projectId: String(raw.projectId ?? ""),
    projectName: raw.projectName ?? "",
    userId: String(raw.responderId ?? raw.userId ?? ""),
    status: mapBookingStatus(raw),
    rewardPoints: raw.rewardPoints ?? 0,
    rewardStatus: raw.rewardStatus ?? "",
    meetingLink: raw.meetingLink ?? raw.conferenceHash,
    createdAt: raw.modifiedOn ?? raw.createdAt,
    serviceCategory: raw.serviceCategory ?? "MRA",
  };
}

function mapBooking(raw: any): Booking {
  return {
    id: String(raw.id ?? ""),
    slotId: String(raw.id ?? raw.slotId ?? ""),
    slotStart: raw.startTime ?? raw.slotStart ?? "",
    slotEnd: raw.endTime ?? raw.slotEnd ?? "",
    moderatorId: String(raw.moderatorId ?? ""),
    moderatorName: raw.moderatorName ?? "",
    projectId: String(raw.projectId ?? ""),
    userId: String(raw.responderId ?? raw.userId ?? ""),
    status: mapBookingStatus(raw),
    meetingLink: raw.meetingLink ?? raw.conferenceHash,
    createdAt: raw.modifiedOn ?? raw.createdAt,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── API ──────────────────────────────────────────────────────────────────────

export const bookingsApi = {
  createBooking: async (payload: CreateBookingPayload): Promise<Booking> => {
    const response = await apiClient.post("/bookings", payload);
    return mapBooking(unwrapOne(response.data));
  },

  getAllBookings: async (status?: string): Promise<EnrichedBooking[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get("/bookings", { params });
    return unwrapList(response.data).map(mapEnrichedBooking);
  },

  getBookingsByUser: async (userId: string): Promise<Booking[]> => {
    const response = await apiClient.get(`/bookings/${userId}`);
    return unwrapList(response.data).map(mapBooking);
  },

  updateBooking: async (
    id: string,
    data: Partial<Pick<Booking, "status">>
  ): Promise<Booking> => {
    const response = await apiClient.put(`/bookings/${id}`, data);
    return mapBooking(unwrapOne(response.data));
  },

  updateReward: async (
    id: string,
    data: { rewardStatus: "credited" | "not_credited"; rewardPoints: number }
  ): Promise<void> => {
    await apiClient.put(`/bookings/${id}/reward`, data);
  },

  cancelInterview: async (
    id: string,
    reason?: string
  ): Promise<void> => {
    await apiClient.post(`/interviews/${id}/cancel`, { reason });
  },

  rescheduleInterview: async (
    id: string,
    data: { newStartTime: string; newEndTime: string; reason?: string }
  ): Promise<void> => {
    await apiClient.post(`/interviews/${id}/reschedule`, data);
  },
};
