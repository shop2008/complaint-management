import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../middleware/errorHandler";
import ComplaintModel from "../models/complaint";
import { HttpStatus } from "../types/api.types";
import logger from "../config/logger";
import { ErrorTracker } from "../utils/errorTracker";

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
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const complaintData = createComplaintSchema.parse(req.body);
    const complaint = await ComplaintModel.create(complaintData);
    res
      .status(HttpStatus.CREATED)
      .json(createSuccessResponse(complaint, "Complaint created successfully"));
  } catch (error) {
    next(error);
  }
});

// Get all complaints
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    logger.info("Fetching all complaints with filters", {
      userId: (req as any).user?.uid,
      filters: req.query,
    });

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      assigned_staff: req.query.assigned_staff as string,
    };

    const result = await ComplaintModel.findAll(page, pageSize, filters);
    res.status(HttpStatus.OK).json(
      createSuccessResponse({
        complaints: result.complaints,
        total: result.total,
        page,
        pageSize,
      })
    );
  } catch (error: any) {
    // Use the error tracker to log this error with context
    ErrorTracker.trackError(
      error,
      "complaints.findAll",
      (req as any).user?.uid
    );
    next(error);
  }
});

// Get complaints by user ID
router.get("/user/:userId", authMiddleware, async (req, res, next) => {
  try {
    const complaints = await ComplaintModel.findByUserId(req.params.userId);
    res
      .status(HttpStatus.OK)
      .json(
        createSuccessResponse(complaints, "Complaints fetched successfully")
      );
  } catch (error) {
    next(error);
  }
});

// Get complaint by ID
router.get("/:complaintId", authMiddleware, async (req, res, next) => {
  try {
    const complaint = await ComplaintModel.findById(
      Number(req.params.complaintId)
    );
    if (!complaint) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json(
          createErrorResponse(
            "Complaint not found",
            "Complaint not found",
            HttpStatus.NOT_FOUND
          )
        );
    }
    res
      .status(HttpStatus.OK)
      .json(createSuccessResponse(complaint, "Complaint fetched successfully"));
  } catch (error) {
    next(error);
  }
});

// Update a complaint
router.patch("/:complaintId", authMiddleware, async (req, res, next) => {
  try {
    const updates = updateComplaintSchema.parse(req.body);
    const complaint = await ComplaintModel.update(
      Number(req.params.complaintId),
      updates
    );
    if (!complaint) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json(
          createErrorResponse(
            "Complaint not found",
            "Complaint not found",
            HttpStatus.NOT_FOUND
          )
        );
    }
    res
      .status(HttpStatus.OK)
      .json(createSuccessResponse(complaint, "Complaint updated successfully"));
  } catch (error) {
    next(error);
  }
});

// Delete a complaint
router.delete("/:complaintId", authMiddleware, async (req, res, next) => {
  try {
    logger.info(`Deleting complaint with ID ${req.params.complaintId}`, {
      userId: (req as any).user?.uid,
    });

    const success = await ComplaintModel.delete(Number(req.params.complaintId));
    if (!success) {
      // Log warning for non-existent resource access attempt
      ErrorTracker.trackException(
        `Attempt to delete non-existent complaint ${req.params.complaintId}`,
        "complaints.delete",
        { userId: (req as any).user?.uid }
      );

      return res
        .status(HttpStatus.NOT_FOUND)
        .json(
          createErrorResponse(
            "Complaint not found or could not be deleted",
            "Complaint not found or could not be deleted",
            HttpStatus.NOT_FOUND
          )
        );
    }

    logger.info(`Successfully deleted complaint ${req.params.complaintId}`);
    res
      .status(HttpStatus.OK)
      .json(createSuccessResponse(null, "Complaint deleted successfully"));
  } catch (error: any) {
    // Use the error tracker for critical errors
    if (error.code === "CRITICAL_DB_ERROR") {
      ErrorTracker.trackCritical(
        error,
        `complaints.delete - ID: ${req.params.complaintId}`,
        (req as any).user?.uid
      );
    } else {
      ErrorTracker.trackError(
        error,
        `complaints.delete - ID: ${req.params.complaintId}`,
        (req as any).user?.uid
      );
    }
    next(error);
  }
});

export default router;
