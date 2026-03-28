import apiClient from "../axios";

export type WaitingStatus = "waiting" | "matched" | "expired";

export interface WaitingQueueEntry {
  id: string;
  participantEmail?: string;
  participantName?: string;
  preferredDays: string[];
  preferredEnd: string;
  preferredStart: string;
  projectId: string;
  projectName?: string;
  status: WaitingStatus;
  timezone: string;
  userId: string;
  waitingSince: string;
}

export interface AddToQueuePayload {
  preferredDays: string[];
  preferredEnd: string;
  preferredStart: string;
  projectId: string;
  timezone: string;
  userId: string;
}

export interface MatchSlotsResult {
  assigned: number;
  invited: number;
  message: string;
}

export const waitingQueueApi = {
  addToQueue: async (
    payload: AddToQueuePayload
  ): Promise<WaitingQueueEntry> => {
    const response = await apiClient.post("/waiting-queue", payload);
    return response.data;
  },

  getQueue: async (projectId?: string): Promise<WaitingQueueEntry[]> => {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get("/waiting-queue", { params });
    return response.data;
  },

  removeFromQueue: async (id: string): Promise<void> => {
    await apiClient.delete(`/waiting-queue/${id}`);
  },

  triggerMatching: async (projectId?: string): Promise<MatchSlotsResult> => {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.post("/match-slots", null, { params });
    return response.data;
  },
};
