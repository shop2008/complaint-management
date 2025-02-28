import { Router } from "express";
import { z } from "zod";
import FeedbackModel from "../models/feedback";
import { authMiddleware } from "../middleware/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../middleware/errorHandler";
import { AppError, ErrorCode, HttpStatus } from "../types/api.types";
const router = Router();

const createFeedbackSchema = z.object({
  complaint_id: z.number(),
  rating: z.number().min(1).max(5),
  comments: z.string().optional(),
});

// Create feedback
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const feedbackData = createFeedbackSchema.parse(req.body);
    const feedback = await FeedbackModel.create(feedbackData);
    res
      .status(HttpStatus.CREATED)
      .json(createSuccessResponse(feedback, "Feedback created successfully"));
  } catch (error) {
    next(error);
  }
});

// Get feedback by complaint ID
router.get("/:complaintId", authMiddleware, async (req, res, next) => {
  try {
    const feedback = await FeedbackModel.findByComplaintId(
      Number(req.params.complaintId)
    );
    if (!feedback) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json(
          createErrorResponse(
            "Feedback not found",
            "Feedback not found",
            HttpStatus.NOT_FOUND
          )
        );
    }
    res
      .status(HttpStatus.OK)
      .json(createSuccessResponse(feedback, "Feedback fetched successfully"));
  } catch (error) {
    next(error);
  }
});

export default router;
