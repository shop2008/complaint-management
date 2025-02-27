import { Router } from "express";
import { z } from "zod";
import AttachmentModel from "../models/attachment";

const router = Router();

const createAttachmentSchema = z.object({
  complaint_id: z.number(),
  file_url: z.string().url(),
});

router.post("/", async (req, res) => {
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

router.get("/complaint/:complaintId", async (req, res) => {
  try {
    const attachments = await AttachmentModel.findByComplaintId(
      Number(req.params.complaintId)
    );
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:attachmentId", async (req, res) => {
  try {
    await AttachmentModel.delete(Number(req.params.attachmentId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
