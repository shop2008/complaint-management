import axiosInstance from "./axiosConfig";
import { ApiResponse } from "../types/api.types";

const feedbackApi = {
  /**
   * Create feedback for a complaint
   */
  async createFeedback(data: {
    complaint_id: number;
    rating: number;
    comments?: string;
  }) {
    const response = await axiosInstance.post<ApiResponse>(`/feedback`, data);
    return response.data.data;
  },

  /**
   * Get feedback by complaint ID
   */
  async getFeedbackByComplaintId(complaintId: number) {
    const response = await axiosInstance.get<ApiResponse>(
      `/feedback/${complaintId}`
    );
    return response.data.data;
  },
};

export default feedbackApi;
