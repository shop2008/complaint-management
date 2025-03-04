import { Router } from "express";
import AttachmentController from "../controllers/AttachmentController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Create an attachment
router.post(
  "/",
  authMiddleware,
  AttachmentController.createAttachment.bind(AttachmentController)
);

// Get complaint attachments
router.get(
  "/:complaintId",
  authMiddleware,
  AttachmentController.getAttachmentsByComplaintId.bind(AttachmentController)
);

// Delete attachment
router.delete(
  "/:id",
  authMiddleware,
  AttachmentController.deleteAttachment.bind(AttachmentController)
);

export default router;
