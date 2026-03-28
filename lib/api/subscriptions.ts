import api from "../axios";

export interface SubscriptionPayload {
  aeConsent: boolean;
  aeReporting: string;
  businessType: string;
  company: string;
  createdAt?: string;
  csUser: string;
  currency: string;
  id?: string;
  markets: string;
  panels: string;
  phone: string;
  plan: string;
  pmContact: string;
  projectIds?: string[];
  salesContact: string;
  salesforceAccount: string;
  serviceType: string;
  shortCode: string;
  skipSfValidation: boolean;
  updatedAt?: string;
}

export const subscriptionsApi = {
  // Create a new subscription
  createSubscription: async (data: SubscriptionPayload) => {
    try {
      const response = await api.post("/subscription", data);
      return response.data;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  },

  // Get all subscriptions
  getSubscriptionsList: async () => {
    try {
      const response = await api.get("/subscriptions");
      return response.data;
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }
  },

  // Get a specific subscription
  getSubscription: async (id: string) => {
    try {
      const response = await api.get(`/subscription/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      throw error;
    }
  },

  // Update a subscription
  updateSubscription: async (
    id: string,
    data: Partial<SubscriptionPayload>
  ) => {
    try {
      const response = await api.put(`/subscription/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }
  },

  // Delete a subscription
  deleteSubscription: async (id: string) => {
    try {
      const response = await api.delete(`/subscription/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting subscription:", error);
      throw error;
    }
  },
};
