import { RowDataPacket } from "mysql2";
import db from "../config/database";
import {
  Complaint,
  ComplaintPriority,
  ComplaintStatus,
} from "../types/complaint.types";
export interface CreateComplaintDto {
  user_id: string;
  category: string;
  description: string;
  priority?: ComplaintPriority;
}

export interface UpdateComplaintDto {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  assigned_staff?: string;
}

class ComplaintModel {
  async create(complaint: CreateComplaintDto): Promise<Complaint> {
    const [result] = await db.execute(
      `INSERT INTO Complaints (user_id, category, description, priority) 
       VALUES (?, ?, ?, ?)`,
      [
        complaint.user_id,
        complaint.category,
        complaint.description,
        complaint.priority || "Medium",
      ]
    );

    const [newComplaint] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Complaints WHERE complaint_id = ?",
      [(result as any).insertId]
    );

    return newComplaint[0] as Complaint;
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    filters: Record<string, string> = {}
  ): Promise<{ complaints: Complaint[]; total: number }> {
    try {
      const offset = (page - 1) * pageSize;
      const conditions: string[] = [];
      const values: any[] = [];

      // Build WHERE clause and values array
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          conditions.push(`${key} = ?`);
          values.push(value);
        }
      });

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      // Execute the main query with LIMIT and OFFSET as direct values
      const [complaints] = await db.execute<RowDataPacket[]>(
        `SELECT * FROM Complaints ${whereClause} 
         ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${Number(
          offset
        )}`,
        values
      );

      // Execute count query
      const [countResult] = await db.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM Complaints ${whereClause}`,
        values
      );

      return {
        complaints: complaints as Complaint[],
        total: countResult[0].total,
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }

  async findById(complaintId: number): Promise<Complaint | null> {
    const [complaints] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Complaints WHERE complaint_id = ?",
      [complaintId]
    );

    return (complaints[0] as Complaint) || null;
  }

  async findByUserId(userId: string): Promise<Complaint[]> {
    const [complaints] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Complaints WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return complaints as Complaint[];
  }

  async update(
    complaintId: number,
    updates: UpdateComplaintDto
  ): Promise<Complaint | null> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.status) {
      updateFields.push("status = ?");
      values.push(updates.status);
    }

    if (updates.priority) {
      updateFields.push("priority = ?");
      values.push(updates.priority);
    }

    if (updates.assigned_staff) {
      updateFields.push("assigned_staff = ?");
      values.push(updates.assigned_staff);
    }

    if (updateFields.length === 0) return null;

    values.push(complaintId);
    const query = `UPDATE Complaints SET ${updateFields.join(", ")} 
                   WHERE complaint_id = ?`;
    await db.execute(query, values);

    return this.findById(complaintId);
  }
}

export default new ComplaintModel();
