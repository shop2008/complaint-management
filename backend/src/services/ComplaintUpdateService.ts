import logger from "../config/logger";
import ComplaintUpdateModel, {
  CreateComplaintUpdateDto,
} from "../models/complaintUpdate";
import { ComplaintUpdate } from "../types/complaint.types";

class ComplaintUpdateService {
  private readonly complaintUpdateModel: typeof ComplaintUpdateModel;

  constructor() {
    this.complaintUpdateModel = ComplaintUpdateModel;
  }

  // create complaint update
  async createUpdate(
    updateData: CreateComplaintUpdateDto
  ): Promise<ComplaintUpdate> {
    try {
      logger.info("Creating new complaint update", {
        complaintId: updateData.complaint_id,
        status: updateData.status,
        updatedBy: updateData.updated_by,
      });

      const update = await this.complaintUpdateModel.create(updateData);
      logger.info("Complaint update created successfully", {
        updateId: update.update_id,
        complaintId: update.complaint_id,
      });

      return update;
    } catch (error) {
      logger.error("Error creating complaint update", {
        error,
        complaintId: updateData.complaint_id,
        status: updateData.status,
      });
      throw error;
    }
  }

  // get updates by complaint id
  async getUpdatesByComplaintId(
    complaintId: number
  ): Promise<ComplaintUpdate[]> {
    try {
      logger.info("Fetching updates for complaint", { complaintId });
      const updates = await this.complaintUpdateModel.findByComplaintId(
        complaintId
      );
      logger.info("Complaint updates fetched successfully", {
        complaintId,
        count: updates.length,
      });
      return updates;
    } catch (error) {
      logger.error("Error fetching complaint updates", { error, complaintId });
      throw error;
    }
  }

  // get latest update by complaint id
  async getLatestUpdate(complaintId: number): Promise<ComplaintUpdate | null> {
    try {
      logger.info("Fetching latest update for complaint", { complaintId });
      const update = await this.complaintUpdateModel.getLatestUpdate(
        complaintId
      );

      if (!update) {
        logger.info("No updates found for complaint", { complaintId });
      } else {
        logger.info("Latest update fetched successfully", {
          updateId: update.update_id,
          complaintId: update.complaint_id,
        });
      }

      return update;
    } catch (error) {
      logger.error("Error fetching latest update", { error, complaintId });
      throw error;
    }
  }

  // delete complaint update
  async deleteUpdate(updateId: number): Promise<boolean> {
    try {
      logger.info("Deleting complaint update", { updateId });
      const success = await this.complaintUpdateModel.delete(updateId);

      if (success) {
        logger.info("Complaint update deleted successfully", { updateId });
      } else {
        logger.warn("Failed to delete complaint update", { updateId });
      }

      return success;
    } catch (error) {
      logger.error("Error deleting complaint update", { error, updateId });
      throw error;
    }
  }
}

export default new ComplaintUpdateService();
