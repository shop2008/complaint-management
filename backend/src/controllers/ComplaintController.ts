import { NextFunction, Request, Response } from "express";
import { createSuccessResponse } from "../middleware/errorHandler";
import {
  createComplaintSchema,
  updateComplaintSchema,
} from "../schemas/validation.schemas";
import ComplaintService from "../services/ComplaintService";
import { HttpStatus } from "../types/api.types";

class ComplaintController {
  private readonly complaintService: typeof ComplaintService;

  constructor() {
    this.complaintService = ComplaintService;
  }

  // Create a new complaint
  async createComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      const complaintData = createComplaintSchema.parse(req.body);
      const complaint = await this.complaintService.createComplaint(
        complaintData
      );
      res
        .status(HttpStatus.CREATED)
        .json(
          createSuccessResponse(complaint, "Complaint created successfully")
        );
    } catch (error) {
      next(error);
    }
  }

  // Get all complaints
  async getAllComplaints(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const filters = req.query as Record<string, string>;

      const { complaints, total } =
        await this.complaintService.getAllComplaints(page, pageSize, filters);

      res
        .status(HttpStatus.OK)
        .json(
          createSuccessResponse(
            { complaints, total, page, pageSize },
            "Complaints fetched successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  }

  // Get complaint by ID
  async getComplaintById(req: Request, res: Response, next: NextFunction) {
    try {
      const complaintId = Number(req.params.id);
      const complaint = await this.complaintService.getComplaintById(
        complaintId
      );

      if (!complaint) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(createSuccessResponse(null, "Complaint not found"));
      }

      res
        .status(HttpStatus.OK)
        .json(
          createSuccessResponse(complaint, "Complaint fetched successfully")
        );
    } catch (error) {
      next(error);
    }
  }

  // Get complaints by user ID
  async getComplaintsByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      const complaints = await this.complaintService.getComplaintsByUserId(
        userId
      );

      res
        .status(HttpStatus.OK)
        .json(
          createSuccessResponse(complaints, "Complaints fetched successfully")
        );
    } catch (error) {
      next(error);
    }
  }

  // Update a complaint
  async updateComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      const complaintId = Number(req.params.id);
      const updateData = updateComplaintSchema.parse(req.body);
      const complaint = await this.complaintService.updateComplaint(
        complaintId,
        updateData
      );

      res
        .status(HttpStatus.OK)
        .json(
          createSuccessResponse(complaint, "Complaint updated successfully")
        );
    } catch (error) {
      next(error);
    }
  }

  // Delete a complaint
  async deleteComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      const complaintId = Number(req.params.id);
      await this.complaintService.deleteComplaint(complaintId);

      res
        .status(HttpStatus.OK)
        .json(createSuccessResponse(null, "Complaint deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new ComplaintController();
