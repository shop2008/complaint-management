import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const feedbackApi = {
  async createFeedback(data: {
    complaint_id: number;
    rating: number;
    comments?: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/feedback`, data);
    return response.data;
  },

  async getFeedbackByComplaintId(complaintId: number) {
    const response = await axios.get(
      `${API_BASE_URL}/feedback/complaint/${complaintId}`
    );
    return response.data;
  },

  async getAverageRating() {
    const response = await axios.get(`${API_BASE_URL}/feedback/average`);
    return response.data;
  },
};

export default feedbackApi;
