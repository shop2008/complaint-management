import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../middleware/errorHandler";
import ComplaintModel from "../models/complaint";
import ComplaintUpdateModel from "../models/complaintUpdate";
import { AppError, ErrorCode, HttpStatus } from "../types/api.types";
const router = Router();

const createUpdateSchema = z.object({
  complaint_id: z.number(),
  updated_by: z.string(),
  status: z.enum(["Pending", "In Progress", "Resolved", "Closed"]),
  comment: z.string(),
});

// Create a new complaint update
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const updateData = createUpdateSchema.parse(req.body);

    // Create the update
    const update = await ComplaintUpdateModel.create(updateData);

    // Update the complaint status
    await ComplaintModel.update(updateData.complaint_id, {
      status: updateData.status,
    });

    res
      .status(HttpStatus.CREATED)
      .json(
        createSuccessResponse(update, "Complaint update created successfully")
      );
  } catch (error) {
    next(error);
  }
});

// Get complaint updates by complaint ID
router.get("/:complaintId", authMiddleware, async (req, res, next) => {
  try {
    const updates = await ComplaintUpdateModel.findByComplaintId(
      Number(req.params.complaintId)
    );
    res
      .status(HttpStatus.OK)
      .json(
        createSuccessResponse(updates, "Complaint updates fetched successfully")
      );
  } catch (error) {
    next(error);
  }
});

// Delete a complaint update
router.delete("/:updateId", authMiddleware, async (req, res, next) => {
  try {
    const success = await ComplaintUpdateModel.delete(
      Number(req.params.updateId)
    );
    if (!success) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json(
          createErrorResponse(
            "Update not found or could not be deleted",
            "Update not found or could not be deleted",
            HttpStatus.NOT_FOUND
          )
        );
    }
    res
      .status(HttpStatus.OK)
      .json(
        createSuccessResponse(null, "Complaint update deleted successfully")
      );
  } catch (error) {
    next(error);
  }
});

export default router;
