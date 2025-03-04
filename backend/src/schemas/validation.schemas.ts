import { z } from "zod";

// User schemas
export const createUserSchema = z.object({
  user_id: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  role: z.enum(["Admin", "Manager", "Staff", "Customer"]),
});

//update role schema
export const updateRoleSchema = z.object({
  role: z.enum(["Admin", "Manager", "Staff", "Customer"]),
});

// Complaint schemas
export const createComplaintSchema = z.object({
  user_id: z.string(),
  category: z.string(),
  description: z.string(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
});

//update complaint schema
export const updateComplaintSchema = z.object({
  status: z.enum(["Pending", "In Progress", "Resolved", "Closed"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  assigned_staff: z.string().optional(),
});

// Attachment schemas
export const createAttachmentSchema = z.object({
  complaint_id: z.number(),
  file_name: z.string(),
  file_url: z.string().url(),
  file_type: z.string(),
  file_size: z.number(),
});

// Feedback schemas
export const createFeedbackSchema = z.object({
  complaint_id: z.number(),
  rating: z.number().min(1).max(5),
  comments: z.string().optional(),
});

// Complaint Update schemas
export const createComplaintUpdateSchema = z.object({
  complaint_id: z.number(),
  updated_by: z.string(),
  status: z.enum(["Pending", "In Progress", "Resolved", "Closed"]),
  comment: z.string(),
});
