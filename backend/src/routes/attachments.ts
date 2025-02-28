import { Router } from "express";
import { z } from "zod";
import AttachmentModel from "../models/attachment";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const createAttachmentSchema = z.object({
  complaint_id: z.number(),
  file_url: z.string().url(),
});

// Create an attachment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const attachmentData = createAttachmentSchema.parse(req.body);
    const attachment = await AttachmentModel.create(attachmentData);
    res.status(201).json(attachment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get complaint attachments
router.get("/complaint/:complaintId", authMiddleware, async (req, res) => {
  try {
    const attachments = await AttachmentModel.findByComplaintId(
      Number(req.params.complaintId)
    );
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
