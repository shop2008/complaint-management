import { Router } from "express";
import { z } from "zod";
import ComplaintModel from "../models/complaint";

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

router.post("/", async (req, res) => {
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

router.get("/", async (req, res) => {
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

router.get("/user/:userId", async (req, res) => {
  try {
    const complaints = await ComplaintModel.findByUserId(req.params.userId);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:complaintId", async (req, res) => {
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

router.patch("/:complaintId", async (req, res) => {
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

export default router;
