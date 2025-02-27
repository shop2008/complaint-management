import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const attachmentsApi = {
  async createAttachment(data: { complaint_id: number; file_url: string }) {
    const response = await axios.post(`${API_BASE_URL}/attachments`, data);
    return response.data;
  },

  async getComplaintAttachments(complaintId: number) {
    const response = await axios.get(
      `${API_BASE_URL}/attachments/complaint/${complaintId}`
    );
    return response.data;
  },

  async deleteAttachment(attachmentId: number) {
    const response = await axios.delete(
      `${API_BASE_URL}/attachments/${attachmentId}`
    );
    return response.data;
  },
};

export default attachmentsApi;
