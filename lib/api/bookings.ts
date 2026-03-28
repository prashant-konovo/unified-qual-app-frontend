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

export const bookingsApi = {
  createBooking: async (payload: CreateBookingPayload): Promise<Booking> => {
    const response = await apiClient.post("/bookings", payload);
    return response.data;
  },

  getAllBookings: async (status?: string): Promise<EnrichedBooking[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get("/bookings", { params });
    return response.data;
  },

  getBookingsByUser: async (userId: string): Promise<Booking[]> => {
    const response = await apiClient.get(`/bookings/${userId}`);
    return response.data;
  },

  updateBooking: async (
    id: string,
    data: Partial<Pick<Booking, "status">>
  ): Promise<Booking> => {
    const response = await apiClient.put(`/bookings/${id}`, data);
    return response.data;
  },

  updateReward: async (
    id: string,
    data: { rewardStatus: "credited" | "not_credited"; rewardPoints: number }
  ): Promise<void> => {
    await apiClient.put(`/bookings/${id}/reward`, data);
  },
};
