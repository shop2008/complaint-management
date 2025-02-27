import { RowDataPacket } from "mysql2";
import db from "../config/database";
import { Feedback } from "../types/complaint.types";

export interface CreateFeedbackDto {
  complaint_id: number;
  rating: number;
  comments?: string;
}

class FeedbackModel {
  async create(feedback: CreateFeedbackDto): Promise<Feedback> {
    const [result] = await db.execute(
      "INSERT INTO Feedback (complaint_id, rating, comments) VALUES (?, ?, ?)",
      [feedback.complaint_id, feedback.rating, feedback.comments]
    );

    const [newFeedback] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Feedback WHERE feedback_id = ?",
      [(result as any).insertId]
    );

    return newFeedback[0] as Feedback;
  }

  async findByComplaintId(complaintId: number): Promise<Feedback | null> {
    const [feedback] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Feedback WHERE complaint_id = ?",
      [complaintId]
    );

    return (feedback[0] as Feedback) || null;
  }

  async getAverageRating(): Promise<number> {
    const [result] = await db.execute<RowDataPacket[]>(
      "SELECT AVG(rating) as average FROM Feedback"
    );

    return result[0].average || 0;
  }
}

export default new FeedbackModel();
