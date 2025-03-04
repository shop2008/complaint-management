import FeedbackModel, { CreateFeedbackDto } from "../models/feedback";
import { Feedback } from "../types/complaint.types";
import logger from "../config/logger";

class FeedbackService {
  private feedbackModel: typeof FeedbackModel;

  constructor() {
    this.feedbackModel = FeedbackModel;
  }

  async createFeedback(feedbackData: CreateFeedbackDto): Promise<Feedback> {
    try {
      logger.info("Creating new feedback", {
        complaintId: feedbackData.complaint_id,
      });

      // Check if feedback already exists for this complaint
      const existingFeedback = await this.feedbackModel.findByComplaintId(
        feedbackData.complaint_id
      );
      if (existingFeedback) {
        logger.warn("Feedback already exists for complaint", {
          complaintId: feedbackData.complaint_id,
        });
        throw new Error("Feedback already exists for this complaint");
      }

      const feedback = await this.feedbackModel.create(feedbackData);
      logger.info("Feedback created successfully", {
        feedbackId: feedback.feedback_id,
        complaintId: feedback.complaint_id,
      });

      return feedback;
    } catch (error) {
      logger.error("Error creating feedback", {
        error,
        complaintId: feedbackData.complaint_id,
      });
      throw error;
    }
  }

  async getFeedbackByComplaintId(
    complaintId: number
  ): Promise<Feedback | null> {
    try {
      logger.info("Fetching feedback for complaint", { complaintId });
      const feedback = await this.feedbackModel.findByComplaintId(complaintId);

      if (!feedback) {
        logger.info("No feedback found for complaint", { complaintId });
      } else {
        logger.info("Feedback fetched successfully", {
          feedbackId: feedback.feedback_id,
          complaintId: feedback.complaint_id,
        });
      }

      return feedback;
    } catch (error) {
      logger.error("Error fetching feedback", { error, complaintId });
      throw error;
    }
  }

  async updateFeedback(
    complaintId: number,
    rating: number,
    comments?: string
  ): Promise<Feedback | null> {
    try {
      logger.info("Updating feedback", { complaintId, rating });

      // First check if feedback exists
      const existingFeedback = await this.feedbackModel.findByComplaintId(
        complaintId
      );
      if (!existingFeedback) {
        logger.warn("No feedback found to update", { complaintId });
        return null;
      }

      // Update feedback
      const updatedFeedback = await this.feedbackModel.create({
        complaint_id: complaintId,
        rating,
        comments,
      });

      logger.info("Feedback updated successfully", {
        feedbackId: updatedFeedback.feedback_id,
        complaintId: updatedFeedback.complaint_id,
      });

      return updatedFeedback;
    } catch (error) {
      logger.error("Error updating feedback", { error, complaintId });
      throw error;
    }
  }
}

export default new FeedbackService();
