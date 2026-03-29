import apiClient from "../axios";

export type ServiceCategory = "LS" | "MRA";
export type ModeratorSource = "qs" | "iris";

export interface Moderator {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  roles?: string[];
  status: "active" | "inactive";
  source?: ModeratorSource;
  serviceCategory?: ServiceCategory;
  timezone?: string;
  firstName?: string;
  lastName?: string;
  moderatorBuffer?: number;
  termsAccepted?: boolean;
  updatedAt?: string;
  createdAt?: string;
  lastActive?: string;
  registeredAt?: string;
  lastLogin?: string;
  isDeleted?: boolean;
}

/** Backward compat alias. */
export type User = Moderator;

export interface BulkUploadResult {
  created: number;
  errors: { row: number; email?: string; error: string }[];
  failed: number;
}

// ── Response mapping helpers ──────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function unwrapOne(body: any): any {
  return body?.data ?? body;
}

function mapModerator(raw: any): Moderator {
  return {
    ...raw,
    id: raw.id,
    name:
      raw.name ??
      `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim() ||
      "",
    email: raw.email ?? "",
    role: raw.role ?? raw.roles?.[0] ?? "moderator",
    status: raw.status ?? "active",
    updatedAt: raw.updatedAt ?? raw.modifiedOn,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── API ──────────────────────────────────────────────────────────────────────

export const moderatorsApi = {
  getModeratorsList: async (status?: string): Promise<Moderator[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get("/moderators", { params });
    // API returns array directly (not envelope)
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(mapModerator);
  },

  getModerator: async (id: string | number, source?: string): Promise<Moderator> => {
    const params = source ? { source } : {};
    const response = await apiClient.get(`/moderators/${id}`, { params });
    return mapModerator(response.data);
  },

  createModerator: async (
    data: Partial<Moderator>
  ): Promise<Moderator> => {
    const response = await apiClient.post("/moderators", data);
    return mapModerator(unwrapOne(response.data));
  },

  updateModerator: async (
    id: string | number,
    data: Partial<Moderator>
  ): Promise<Moderator> => {
    const response = await apiClient.put(`/moderators/${id}`, data);
    return mapModerator(unwrapOne(response.data));
  },

  deleteModerator: async (id: string | number): Promise<void> => {
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
