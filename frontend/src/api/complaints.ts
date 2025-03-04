import {
  ComplaintPriority,
  CreateAttachmentDto,
} from "../types/complaint.types";
import { ApiResponse } from "../types/api.types";
import axiosInstance from "./axiosConfig";

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
    const response = await axiosInstance.post<ApiResponse>("/complaints", data);
    return response.data.data;
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

    const response = await axiosInstance.get<ApiResponse>(
      `/complaints?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get complaints by user ID
   * @param userId - The user ID to get complaints for
   * @returns The complaints
   */
  async getUserComplaints(userId: string) {
    const response = await axiosInstance.get<ApiResponse>(
      `/complaints/user/${userId}`
    );
    return response.data.data;
  },

  /**
   * Get a complaint by ID
   * @param complaintId - The complaint ID to get
   * @returns The complaint
   */
  async getComplaintById(complaintId: number) {
    const response = await axiosInstance.get<ApiResponse>(
      `/complaints/${complaintId}`
    );
    return response.data.data;
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
    const response = await axiosInstance.put<ApiResponse>(
      `/complaints/${complaintId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Create a complaint update
   * @param data - The update data
   * @returns The created update
   */
  async createComplaintUpdate(data: {
    complaint_id: number;
    updated_by: string;
    status: string;
    comment: string;
  }) {
    const response = await axiosInstance.post<ApiResponse>(
      `/complaint-updates`,
      data
    );
    return response.data.data;
  },

  /**
   * Get updates for a complaint
   * @param complaintId - The complaint ID to get updates for
   * @returns The updates
   */
  async getComplaintUpdates(complaintId: number) {
    const response = await axiosInstance.get<ApiResponse>(
      `/complaint-updates/${complaintId}`
    );
    return response.data.data;
  },

  /**
   * Get feedback for a complaint
   * @param complaintId - The complaint ID to get feedback for
   * @returns The feedback
   */
  async getComplaintFeedback(complaintId: number) {
    const response = await axiosInstance.get<ApiResponse>(
      `/feedback/${complaintId}`
    );
    return response.data.data;
  },

  /**
   * Submit feedback for a complaint
   * @param data - The feedback data
   * @returns The created feedback
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
    const response = await axiosInstance.post<ApiResponse>(`/feedback`, {
      complaint_id,
      rating,
      comment,
    });
    return response.data.data;
  },

  /**
   * Create an attachment for a complaint
   * @param data - The attachment data
   * @returns The created attachment
   */
  async createAttachment(data: CreateAttachmentDto) {
    const response = await axiosInstance.post<ApiResponse>(
      `/attachments`,
      data
    );
    return response.data.data;
  },

  /**
   * Get attachments for a complaint
   * @param complaintId - The complaint ID to get attachments for
   * @returns The attachments
   */
  async getComplaintAttachments(complaintId: number) {
    const response = await axiosInstance.get<ApiResponse>(
      `/attachments/${complaintId}`
    );
    return response.data.data;
  },

  /**
   * Delete a complaint
   * @param complaintId - The complaint ID to delete
   * @returns Success status
   */
  async deleteComplaint(complaintId: number) {
    const response = await axiosInstance.delete<ApiResponse>(
      `/complaints/${complaintId}`
    );
    return response.data.success;
  },

  /**
   * Delete a complaint update
   * @param updateId - The update ID to delete
   * @returns Success status
   */
  async deleteComplaintUpdate(updateId: number) {
    const response = await axiosInstance.delete<ApiResponse>(
      `/complaint-updates/${updateId}`
    );
    return response.data.success;
  },
};

export default complaintsApi;
