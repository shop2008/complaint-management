import axios from "axios";
import {
  ComplaintPriority,
  CreateAttachmentDto,
} from "../types/complaint.types";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface CreateComplaintDto {
  user_id: string;
  category: string;
  description: string;
  priority: ComplaintPriority;
}

const complaintsApi = {
  /**
   * Create a new complaint
   * @param data - The complaint data to create
   * @returns The created complaint
   */
  async createComplaint(data: CreateComplaintDto) {
    const response = await axios.post(`${API_BASE_URL}/complaints`, data);
    return response.data;
  },

  /**
   * Get all complaints
   * @param page - The page number to get
   * @param pageSize - The number of complaints per page
   * @param filters - The filters to apply to the complaints
   * @returns The complaints
   */
  async getComplaints(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      status?: string;
      priority?: string;
      assigned_staff?: string;
    }
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.assigned_staff && {
        assigned_staff: filters.assigned_staff,
      }),
    });

    const response = await axios.get(`${API_BASE_URL}/complaints?${params}`);
    return response.data;
  },

  /**
   * Get all complaints for a user
   * @param userId - The user ID to get complaints for
   * @returns The complaints
   */
  async getUserComplaints(userId: string) {
    const response = await axios.get(
      `${API_BASE_URL}/complaints/user/${userId}`
    );
    return response.data;
  },

  async getComplaintById(complaintId: number) {
    const response = await axios.get(
      `${API_BASE_URL}/complaints/${complaintId}`
    );
    return response.data;
  },

  /**
   * Update a complaint
   * @param complaintId - The complaint ID to update
   * @param data - The data to update the complaint with
   * @returns The updated complaint
   */
  async updateComplaint(
    complaintId: number,
    data: {
      status?: string;
      priority?: string;
      assigned_staff?: string;
    }
  ) {
    const response = await axios.patch(
      `${API_BASE_URL}/complaints/${complaintId}`,
      data
    );
    return response.data;
  },

  /**
   * Create a new complaint update
   * @param data - The complaint update data to create
   * @returns The created complaint update
   */
  async createComplaintUpdate(data: {
    complaint_id: number;
    updated_by: string;
    status: string;
    comment: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/updates`, data);
    return response.data;
  },

  /**
   * Get updates for a complaint
   */
  async getComplaintUpdates(complaintId: number) {
    const response = await axios.get(
      `${API_BASE_URL}/updates/complaint/${complaintId}`
    );
    return response.data;
  },

  /**
   * Get feedback for a complaint
   */
  async getComplaintFeedback(complaintId: number) {
    const response = await axios.get(
      `${API_BASE_URL}/feedback/complaint/${complaintId}`
    );
    return response.data;
  },

  /**
   * Upload an attachment for a complaint
   */
  async uploadAttachment(
    formData: FormData,
    onProgress: (progress: number) => void
  ) {
    const response = await axios.post(`${API_BASE_URL}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  submitFeedback: async ({
    complaint_id,
    rating,
    comment,
  }: {
    complaint_id: number;
    rating: number;
    comment: string;
  }) => {
    const response = await axios.post(`${API_BASE_URL}/feedback`, {
      complaint_id,
      rating,
      comments: comment,
    });
    return response.data;
  },

  /**
   * Create a new attachment for a complaint
   */
  async createAttachment(data: CreateAttachmentDto) {
    const response = await axios.post(`${API_BASE_URL}/attachments`, data);
    return response.data;
  },

  /**
   * Get attachments for a complaint
   * @param complaintId - The complaint ID to get attachments for
   * @returns The attachments for the complaint
   */
  async getComplaintAttachments(complaintId: number) {
    const response = await axios.get(
      `${API_BASE_URL}/attachments/complaint/${complaintId}`
    );
    return response.data;
  },
};

export default complaintsApi;
