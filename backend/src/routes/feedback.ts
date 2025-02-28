import { Router } from "express";
import { z } from "zod";
import FeedbackModel from "../models/feedback";
import { authMiddleware } from "../middleware/auth";
const router = Router();

const createFeedbackSchema = z.object({
  complaint_id: z.number(),
  rating: z.number().min(1).max(5),
  comments: z.string().optional(),
});

// Create feedback
router.post("/", authMiddleware, async (req, res) => {
  try {
    const feedbackData = createFeedbackSchema.parse(req.body);
    const feedback = await FeedbackModel.create(feedbackData);
    res.status(201).json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get feedback by complaint ID
router.get("/complaint/:complaintId", authMiddleware, async (req, res) => {
  try {
    const feedback = await FeedbackModel.findByComplaintId(
      Number(req.params.complaintId)
    );
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
