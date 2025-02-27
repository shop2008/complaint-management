import { Router } from "express";
import { z } from "zod";
import ComplaintUpdateModel from "../models/complaintUpdate";
import ComplaintModel from "../models/complaint";
import { authMiddleware } from "../middleware/auth";
const router = Router();

const createUpdateSchema = z.object({
  complaint_id: z.number(),
  updated_by: z.string(),
  status: z.enum(["Pending", "In Progress", "Resolved", "Closed"]),
  comment: z.string(),
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const updateData = createUpdateSchema.parse(req.body);

    // Create the update
    const update = await ComplaintUpdateModel.create(updateData);

    // Update the complaint status
    await ComplaintModel.update(updateData.complaint_id, {
      status: updateData.status,
    });

    res.status(201).json(update);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.get("/complaint/:complaintId", authMiddleware, async (req, res) => {
  try {
    const updates = await ComplaintUpdateModel.findByComplaintId(
      Number(req.params.complaintId)
    );
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
