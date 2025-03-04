import AttachmentModel, { CreateAttachmentDto } from "../models/attachment";
import { Attachment } from "../types/complaint.types";
import logger from "../config/logger";

class AttachmentService {
  private readonly attachmentModel: typeof AttachmentModel;

  constructor() {
    this.attachmentModel = AttachmentModel;
  }

  // create attachment
  async createAttachment(
    attachmentData: CreateAttachmentDto
  ): Promise<Attachment> {
    try {
      logger.info("Creating new attachment", {
        complaintId: attachmentData.complaint_id,
        fileName: attachmentData.file_name,
      });

      const attachment = await this.attachmentModel.create(attachmentData);
      logger.info("Attachment created successfully", {
        attachmentId: attachment.attachment_id,
        complaintId: attachment.complaint_id,
      });

      return attachment;
    } catch (error) {
      logger.error("Error creating attachment", {
        error,
        complaintId: attachmentData.complaint_id,
        fileName: attachmentData.file_name,
      });
      throw error;
    }
  }

  // get attachments by complaint id
  async getAttachmentsByComplaintId(
    complaintId: number
  ): Promise<Attachment[]> {
    try {
      logger.info("Fetching attachments for complaint", { complaintId });
      const attachments = await this.attachmentModel.findByComplaintId(
        complaintId
      );
      logger.info("Attachments fetched successfully", {
        complaintId,
        count: attachments.length,
      });
      return attachments;
    } catch (error) {
      logger.error("Error fetching attachments", { error, complaintId });
      throw error;
    }
  }

  // delete attachment
  async deleteAttachment(attachmentId: number): Promise<void> {
    try {
      logger.info("Deleting attachment", { attachmentId });
      await this.attachmentModel.delete(attachmentId);
      logger.info("Attachment deleted successfully", { attachmentId });
    } catch (error) {
      logger.error("Error deleting attachment", { error, attachmentId });
      throw error;
    }
  }
}

export default new AttachmentService();
