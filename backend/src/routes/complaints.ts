import { Router } from "express";
import { z } from "zod";
import ComplaintModel from "../models/complaint";
import { authMiddleware } from "../middleware/auth";
const router = Router();

const createComplaintSchema = z.object({
  user_id: z.string(),
  category: z.string(),
  description: z.string(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
});

const updateComplaintSchema = z.object({
  status: z.enum(["Pending", "In Progress", "Resolved", "Closed"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  assigned_staff: z.string().optional(),
});

// Create a new complaint
router.post("/", authMiddleware, async (req, res) => {
  try {
    const complaintData = createComplaintSchema.parse(req.body);
    const complaint = await ComplaintModel.create(complaintData);
    res.status(201).json(complaint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get all complaints
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      assigned_staff: req.query.assigned_staff as string,
    };

    const result = await ComplaintModel.findAll(page, pageSize, filters);
    res.json({
      complaints: result.complaints,
      total: result.total,
      page,
      pageSize,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get complaints by user ID
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const complaints = await ComplaintModel.findByUserId(req.params.userId);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get complaint by ID
router.get("/:complaintId", authMiddleware, async (req, res) => {
  try {
    const complaint = await ComplaintModel.findById(
      Number(req.params.complaintId)
    );
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a complaint
router.patch("/:complaintId", authMiddleware, async (req, res) => {
  try {
    const updates = updateComplaintSchema.parse(req.body);
    const complaint = await ComplaintModel.update(
      Number(req.params.complaintId),
      updates
    );
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.json(complaint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Delete a complaint
router.delete("/:complaintId", authMiddleware, async (req, res) => {
  try {
    const success = await ComplaintModel.delete(Number(req.params.complaintId));
    if (!success) {
      return res
        .status(404)
        .json({ error: "Complaint not found or could not be deleted" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
