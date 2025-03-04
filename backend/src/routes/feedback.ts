import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import FeedbackController from "../controllers/FeedbackController";

const router = Router();

// Submit feedback for a complaint
router.post(
  "/",
  authMiddleware,
  FeedbackController.createFeedback.bind(FeedbackController)
);

// Get feedback for a complaint
router.get(
  "/:complaintId",
  authMiddleware,
  FeedbackController.getFeedbackByComplaintId.bind(FeedbackController)
);

export default router;
