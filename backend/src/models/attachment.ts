import { RowDataPacket } from "mysql2";
import db from "../config/database";
import { Attachment } from "../types/complaint.types";

export interface CreateAttachmentDto {
  complaint_id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

class AttachmentModel {
  async create(attachment: CreateAttachmentDto): Promise<Attachment> {
    const [result] = await db.execute(
      "INSERT INTO Attachments (complaint_id, file_name, file_url, file_type, file_size) VALUES (?, ?, ?, ?, ?)",
      [
        attachment.complaint_id,
        attachment.file_name,
        attachment.file_url,
        attachment.file_type,
        attachment.file_size,
      ]
    );

    const [newAttachment] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Attachments WHERE attachment_id = ?",
      [(result as any).insertId]
    );

    return newAttachment[0] as Attachment;
  }

  async findByComplaintId(complaintId: number): Promise<Attachment[]> {
    const [attachments] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Attachments WHERE complaint_id = ? ORDER BY uploaded_at DESC",
      [complaintId]
    );

    return attachments as Attachment[];
  }

  async delete(attachmentId: number): Promise<void> {
    await db.execute("DELETE FROM Attachments WHERE attachment_id = ?", [
      attachmentId,
    ]);
  }
}

export default new AttachmentModel();
