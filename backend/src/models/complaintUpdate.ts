import { RowDataPacket } from "mysql2";
import db from "../config/database";
import { ComplaintUpdate } from "../types/complaint.types";

export interface CreateComplaintUpdateDto {
  complaint_id: number;
  updated_by: string;
  status: "Pending" | "In Progress" | "Resolved" | "Closed";
  comment: string;
}

class ComplaintUpdateModel {
  async create(update: CreateComplaintUpdateDto): Promise<ComplaintUpdate> {
    const [result] = await db.execute(
      "INSERT INTO Complaint_Updates (complaint_id, updated_by, status, comment) VALUES (?, ?, ?, ?)",
      [update.complaint_id, update.updated_by, update.status, update.comment]
    );

    const [newUpdate] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Complaint_Updates WHERE update_id = ?",
      [(result as any).insertId]
    );

    return newUpdate[0] as ComplaintUpdate;
  }

  async findByComplaintId(complaintId: number): Promise<ComplaintUpdate[]> {
    const [updates] = await db.execute<RowDataPacket[]>(
      `SELECT cu.*, u.full_name as updated_by_name 
       FROM Complaint_Updates cu 
       LEFT JOIN Users u ON cu.updated_by = u.user_id 
       WHERE cu.complaint_id = ? 
       ORDER BY cu.updated_at DESC`,
      [complaintId]
    );

    return updates as ComplaintUpdate[];
  }

  async getLatestUpdate(complaintId: number): Promise<ComplaintUpdate | null> {
    const [updates] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Complaint_Updates WHERE complaint_id = ? ORDER BY updated_at DESC LIMIT 1",
      [complaintId]
    );

    return (updates[0] as ComplaintUpdate) || null;
  }

  async delete(updateId: number): Promise<boolean> {
    try {
      await db.execute("DELETE FROM Complaint_Updates WHERE update_id = ?", [
        updateId,
      ]);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new ComplaintUpdateModel();
