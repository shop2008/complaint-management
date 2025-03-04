import logger from "../config/logger";
import ComplaintModel, {
  CreateComplaintDto,
  UpdateComplaintDto,
} from "../models/complaint";
import { Complaint } from "../types/complaint.types";

class ComplaintService {
  private readonly complaintModel: typeof ComplaintModel;

  constructor() {
    this.complaintModel = ComplaintModel;
  }

  // create complaint
  async createComplaint(complaintData: CreateComplaintDto): Promise<Complaint> {
    try {
      logger.info("Creating new complaint", { userId: complaintData.user_id });
      const complaint = await this.complaintModel.create(complaintData);
      logger.info("Complaint created successfully", {
        complaintId: complaint.complaint_id,
      });
      return complaint;
    } catch (error) {
      logger.error("Error creating complaint", {
        error,
        userId: complaintData.user_id,
      });
      throw error;
    }
  }

  // get all complaints
  async getAllComplaints(
    page: number = 1,
    pageSize: number = 10,
    filters: Record<string, string> = {}
  ): Promise<{ complaints: Complaint[]; total: number }> {
    try {
      logger.info("Fetching all complaints", { page, pageSize, filters });
      return await this.complaintModel.findAll(page, pageSize, filters);
    } catch (error) {
      logger.error("Error fetching complaints", {
        error,
        page,
        pageSize,
        filters,
      });
      throw error;
    }
  }

  // get complaint by id
  async getComplaintById(complaintId: number): Promise<Complaint | null> {
    try {
      logger.info("Fetching complaint by ID", { complaintId });
      return await this.complaintModel.findById(complaintId);
    } catch (error) {
      logger.error("Error fetching complaint", { error, complaintId });
      throw error;
    }
  }

  // get complaints by user id
  async getComplaintsByUserId(userId: string): Promise<Complaint[]> {
    try {
      logger.info("Fetching complaints by user ID", { userId });
      return await this.complaintModel.findByUserId(userId);
    } catch (error) {
      logger.error("Error fetching complaints by user ID", { error, userId });
      throw error;
    }
  }

  // update complaint
  async updateComplaint(
    complaintId: number,
    updateData: UpdateComplaintDto
  ): Promise<Complaint | null> {
    try {
      logger.info("Updating complaint", { complaintId, updateData });
      const complaint = await this.complaintModel.update(
        complaintId,
        updateData
      );
      logger.info("Complaint updated successfully", { complaintId });
      return complaint;
    } catch (error) {
      logger.error("Error updating complaint", { error, complaintId });
      throw error;
    }
  }

  // delete complaint
  async deleteComplaint(complaintId: number): Promise<void> {
    try {
      logger.info("Deleting complaint", { complaintId });
      await this.complaintModel.delete(complaintId);
      logger.info("Complaint deleted successfully", { complaintId });
    } catch (error) {
      logger.error("Error deleting complaint", { error, complaintId });
      throw error;
    }
  }
}

export default new ComplaintService();
