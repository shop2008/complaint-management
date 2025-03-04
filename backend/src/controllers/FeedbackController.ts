import { NextFunction, Request, Response } from "express";
import { createSuccessResponse } from "../middleware/errorHandler";
import { createFeedbackSchema } from "../schemas/validation.schemas";
import FeedbackService from "../services/FeedbackService";
import { HttpStatus } from "../types/api.types";

class FeedbackController {
  private readonly feedbackService: typeof FeedbackService;

  constructor() {
    this.feedbackService = FeedbackService;
  }

  // Create a new feedback
  async createFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const feedbackData = createFeedbackSchema.parse(req.body);
      const feedback = await this.feedbackService.createFeedback(feedbackData);
      res
        .status(HttpStatus.CREATED)
        .json(
          createSuccessResponse(feedback, "Feedback submitted successfully")
        );
    } catch (error) {
      next(error);
    }
  }

  // Get feedback by complaint ID
  async getFeedbackByComplaintId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const complaintId = Number(req.params.complaintId);
      const feedback = await this.feedbackService.getFeedbackByComplaintId(
        complaintId
      );

      if (!feedback) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(
            createSuccessResponse(null, "No feedback found for this complaint")
          );
      }

      res
        .status(HttpStatus.OK)
        .json(createSuccessResponse(feedback, "Feedback fetched successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new FeedbackController();
