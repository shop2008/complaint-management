import { Request, Response, NextFunction } from "express";
import ComplaintUpdateService from "../services/ComplaintUpdateService";
import { createSuccessResponse } from "../middleware/errorHandler";
import { HttpStatus } from "../types/api.types";
import { createComplaintUpdateSchema } from "../schemas/validation.schemas";

class ComplaintUpdateController {
  private readonly complaintUpdateService: typeof ComplaintUpdateService;

  constructor() {
    this.complaintUpdateService = ComplaintUpdateService;
  }

  // Create a new complaint update
  async createUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const updateData = createComplaintUpdateSchema.parse(req.body);
      const update = await this.complaintUpdateService.createUpdate(updateData);
      res
        .status(HttpStatus.CREATED)
        .json(
          createSuccessResponse(update, "Complaint update created successfully")
        );
    } catch (error) {
      next(error);
    }
  }

  // Get all updates for a complaint
  async getUpdatesByComplaintId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const complaintId = Number(req.params.complaintId);
      const updates = await this.complaintUpdateService.getUpdatesByComplaintId(
        complaintId
      );
      res
        .status(HttpStatus.OK)
        .json(
          createSuccessResponse(
            updates,
            "Complaint updates fetched successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  }

  // Get latest update for a complaint
  async getLatestUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const complaintId = Number(req.params.complaintId);
      const update = await this.complaintUpdateService.getLatestUpdate(
        complaintId
      );

      if (!update) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(
            createSuccessResponse(null, "No updates found for this complaint")
          );
      }

      res
        .status(HttpStatus.OK)
        .json(
          createSuccessResponse(update, "Latest update fetched successfully")
        );
    } catch (error) {
      next(error);
    }
  }

  // Delete a complaint update
  async deleteUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const updateId = Number(req.params.id);
      const success = await this.complaintUpdateService.deleteUpdate(updateId);

      if (!success) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(
            createSuccessResponse(
              null,
              "Update not found or could not be deleted"
            )
          );
      }

      res
        .status(HttpStatus.OK)
        .json(createSuccessResponse(null, "Update deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new ComplaintUpdateController();
