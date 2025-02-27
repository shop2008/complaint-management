import { RowDataPacket } from "mysql2";
import db from "../config/database";
import { Attachment } from "../types/complaint.types";

export interface CreateAttachmentDto {
  complaint_id: number;
  file_url: string;
}

class AttachmentModel {
  async create(attachment: CreateAttachmentDto): Promise<Attachment> {
    const [result] = await db.execute(
      "INSERT INTO Attachments (complaint_id, file_url) VALUES (?, ?)",
      [attachment.complaint_id, attachment.file_url]
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
