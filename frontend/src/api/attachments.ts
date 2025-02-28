import axiosInstance from "./axiosConfig";
import { ApiResponse } from "../types/api.types";

const attachmentsApi = {
  /**
   * Create an attachment for a complaint
   */
  async createAttachment(data: { complaint_id: number; file_url: string }) {
    const response = await axiosInstance.post<ApiResponse>(
      `/attachments`,
      data
    );
    return response.data.data;
  },

  /**
   * Get complaint attachments
   */
  async getComplaintAttachments(complaintId: number) {
    const response = await axiosInstance.get<ApiResponse>(
      `/attachments/${complaintId}`
    );
    return response.data.data;
  },
};

export default attachmentsApi;
