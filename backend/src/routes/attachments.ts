import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { createSuccessResponse } from "../middleware/errorHandler";
import AttachmentModel from "../models/attachment";
import { HttpStatus } from "../types/api.types";

const router = Router();

const createAttachmentSchema = z.object({
  complaint_id: z.number(),
  file_url: z.string().url(),
  file_name: z.string(),
  file_type: z.string(),
  file_size: z.number(),
});

// Create an attachment
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const attachmentData = createAttachmentSchema.parse(req.body);
    const attachment = await AttachmentModel.create(attachmentData);
    res
      .status(HttpStatus.CREATED)
      .json(
        createSuccessResponse(attachment, "Attachment created successfully")
      );
  } catch (error) {
    next(error);
  }
});

// Get complaint attachments
router.get("/:complaintId", authMiddleware, async (req, res, next) => {
  try {
    const attachments = await AttachmentModel.findByComplaintId(
      Number(req.params.complaintId)
    );
    res
      .status(HttpStatus.OK)
      .json(
        createSuccessResponse(attachments, "Attachments fetched successfully")
      );
  } catch (error) {
    next(error);
  }
});

export default router;
