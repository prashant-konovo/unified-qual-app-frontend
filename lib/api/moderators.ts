import apiClient from "../axios";

/**
 * User is the canonical type for all platform users stored in the "users" collection.
 * The `role` field differentiates moderators, admins, etc.
 */
export interface User {
  createdAt?: string;
  email: string;
  id: string;
  isDeleted?: boolean;
  lastActive?: string;
  name: string;
  phone?: string;
  role: "moderator" | "admin";
  status: "active" | "inactive";
  updatedAt?: string;
}

/** Convenience alias — moderator pages can import either name. */
export type Moderator = User;

export interface BulkUploadResult {
  created: number;
  errors: { row: number; email?: string; error: string }[];
  failed: number;
}

export const moderatorsApi = {
  getModeratorsList: async (status?: string): Promise<Moderator[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get("/moderators", { params });
    return response.data;
  },

  getModerator: async (id: string): Promise<Moderator> => {
    const response = await apiClient.get(`/moderators/${id}`);
    return response.data;
  },

  createModerator: async (
    data: Omit<Moderator, "id" | "createdAt" | "updatedAt" | "isDeleted">
  ): Promise<Moderator> => {
    const response = await apiClient.post("/moderators", data);
    return response.data;
  },

  updateModerator: async (
    id: string,
    data: Partial<Moderator>
  ): Promise<Moderator> => {
    const response = await apiClient.put(`/moderators/${id}`, data);
    return response.data;
  },

  deleteModerator: async (id: string): Promise<void> => {
    await apiClient.delete(`/moderators/${id}`);
  },

  bulkUpload: async (file: File): Promise<BulkUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/moderators/bulk-upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
