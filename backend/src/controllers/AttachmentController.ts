import { Request, Response, NextFunction } from "express";
import AttachmentService from "../services/AttachmentService";
import { createSuccessResponse } from "../middleware/errorHandler";
import { HttpStatus } from "../types/api.types";
import { createAttachmentSchema } from "../schemas/validation.schemas";

class AttachmentController {
  private readonly attachmentService: typeof AttachmentService;

  constructor() {
    this.attachmentService = AttachmentService;
  }

  // Create a new attachment
  async createAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const attachmentData = createAttachmentSchema.parse(req.body);
      const attachment = await this.attachmentService.createAttachment(
        attachmentData
      );
      res
        .status(HttpStatus.CREATED)
        .json(
          createSuccessResponse(attachment, "Attachment created successfully")
        );
    } catch (error) {
      next(error);
    }
  }

  // Get attachments by complaint ID
  async getAttachmentsByComplaintId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const complaintId = Number(req.params.complaintId);
      const attachments =
        await this.attachmentService.getAttachmentsByComplaintId(complaintId);
      res
        .status(HttpStatus.OK)
        .json(
          createSuccessResponse(attachments, "Attachments fetched successfully")
        );
    } catch (error) {
      next(error);
    }
  }

  // Delete an attachment
  async deleteAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const attachmentId = Number(req.params.id);
      await this.attachmentService.deleteAttachment(attachmentId);
      res
        .status(HttpStatus.OK)
        .json(createSuccessResponse(null, "Attachment deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new AttachmentController();
