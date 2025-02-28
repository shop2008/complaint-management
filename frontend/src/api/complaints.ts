import {
  ComplaintPriority,
  CreateAttachmentDto,
} from "../types/complaint.types";
import axiosInstance from "./axiosConfig";
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
    const response = await axiosInstance.post(
      `${API_BASE_URL}/complaints`,
      data
    );
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

    const response = await axiosInstance.get(
      `${API_BASE_URL}/complaints?${params}`
    );
    return response.data;
  },

  /**
   * Get all complaints for a user
   * @param userId - The user ID to get complaints for
   * @returns The complaints
   */
  async getUserComplaints(userId: string) {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/complaints/user/${userId}`
    );
    return response.data;
  },

  async getComplaintById(complaintId: number) {
    const response = await axiosInstance.get(
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
    const response = await axiosInstance.patch(
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
    const response = await axiosInstance.post(
      `${API_BASE_URL}/complaint-updates`,
      data
    );
    return response.data;
  },

  /**
   * Get updates for a complaint
   */
  async getComplaintUpdates(complaintId: number) {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/complaint-updates/complaint/${complaintId}`
    );
    return response.data;
  },

  /**
   * Get feedback for a complaint
   */
  async getComplaintFeedback(complaintId: number) {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/feedback/complaint/${complaintId}`
    );
    return response.data;
  },

  /**
   * Submit feedback for a complaint
   */
  async submitFeedback({
    complaint_id,
    rating,
    comment,
  }: {
    complaint_id: number;
    rating: number;
    comment: string;
  }) {
    const response = await axiosInstance.post(`${API_BASE_URL}/feedback`, {
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
    const response = await axiosInstance.post(
      `${API_BASE_URL}/attachments`,
      data
    );
    return response.data;
  },

  /**
   * Get attachments for a complaint
   * @param complaintId - The complaint ID to get attachments for
   * @returns The attachments for the complaint
   */
  async getComplaintAttachments(complaintId: number) {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/attachments/complaint/${complaintId}`
    );
    return response.data;
  },

  /**
   * Delete a complaint
   * @param complaintId - The ID of the complaint to delete
   */
  async deleteComplaint(complaintId: number) {
    await axiosInstance.delete(`${API_BASE_URL}/complaints/${complaintId}`);
  },

  /**
   * Delete a complaint update
   * @param updateId - The ID of the update to delete
   */
  async deleteComplaintUpdate(updateId: number) {
    await axiosInstance.delete(`${API_BASE_URL}/complaint-updates/${updateId}`);
  },
};

export default complaintsApi;
