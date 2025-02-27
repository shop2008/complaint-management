export interface Complaint {
  complaint_id: number;
  user_id: string;
  category: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assigned_staff?: string;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
}

export type ComplaintStatus = "Pending" | "In Progress" | "Resolved" | "Closed";

export type ComplaintPriority = "Low" | "Medium" | "High";

export interface Attachment {
  attachment_id: number;
  complaint_id: number;
  file_url: string;
  uploaded_at: string;
}

export interface Feedback {
  feedback_id: number;
  complaint_id: number;
  rating: number;
  comments?: string;
  submitted_at: string;
}

export interface ComplaintUpdate {
  update_id: number;
  complaint_id: number;
  updated_by: string;
  status: string;
  comment: string;
  updated_at: string;
  updated_by_name: string;
}
