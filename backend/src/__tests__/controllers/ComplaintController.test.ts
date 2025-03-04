import { Request, Response, NextFunction } from "express";
import ComplaintController from "../../controllers/ComplaintController";
import ComplaintService from "../../services/ComplaintService";
import { HttpStatus } from "../../types/api.types";
import {
  Complaint,
  ComplaintPriority,
  ComplaintStatus,
} from "../../types/complaint.types";

// Mock the ComplaintService
jest.mock("../../services/ComplaintService");

describe("ComplaintController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe("createComplaint", () => {
    it("should create a complaint successfully", async () => {
      const mockComplaintData = {
        user_id: "user123",
        category: "Technical",
        description: "Test complaint",
        priority: "High" as ComplaintPriority,
      };

      const mockCreatedComplaint: Complaint = {
        complaint_id: 1,
        ...mockComplaintData,
        status: "Pending",
        created_at: "2024-03-04T00:00:00Z",
        updated_at: "2024-03-04T00:00:00Z",
      };

      mockRequest.body = mockComplaintData;
      (ComplaintService.createComplaint as jest.Mock).mockResolvedValue(
        mockCreatedComplaint
      );

      await ComplaintController.createComplaint(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(ComplaintService.createComplaint).toHaveBeenCalledWith(
        mockComplaintData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedComplaint,
        message: "Complaint created successfully",
        timestamp: expect.any(String),
      });
    });

    it("should handle validation errors", async () => {
      mockRequest.body = {
        // Missing required fields
        user_id: "user123",
      };

      await ComplaintController.createComplaint(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe("getAllComplaints", () => {
    it("should return paginated complaints with filters", async () => {
      const mockComplaints = [
        {
          complaint_id: 1,
          user_id: "user123",
          category: "Technical",
          description: "Test complaint 1",
          status: "Pending",
          priority: "High",
          created_at: "2024-03-04T00:00:00Z",
          updated_at: "2024-03-04T00:00:00Z",
        },
      ];

      mockRequest.query = {
        page: "1",
        pageSize: "10",
        status: "Pending",
        priority: "High",
      };

      (ComplaintService.getAllComplaints as jest.Mock).mockResolvedValue({
        complaints: mockComplaints,
        total: 1,
      });

      await ComplaintController.getAllComplaints(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(ComplaintService.getAllComplaints).toHaveBeenCalledWith(1, 10, {
        page: "1",
        pageSize: "10",
        status: "Pending",
        priority: "High",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          complaints: mockComplaints,
          total: 1,
          page: 1,
          pageSize: 10,
        },
        message: "Complaints fetched successfully",
        timestamp: expect.any(String),
      });
    });
  });

  describe("getComplaintById", () => {
    it("should return a complaint when found", async () => {
      const mockComplaint: Complaint = {
        complaint_id: 1,
        user_id: "user123",
        category: "Technical",
        description: "Test complaint",
        status: "Pending",
        priority: "High",
        created_at: "2024-03-04T00:00:00Z",
        updated_at: "2024-03-04T00:00:00Z",
      };

      mockRequest.params = { id: "1" };
      (ComplaintService.getComplaintById as jest.Mock).mockResolvedValue(
        mockComplaint
      );

      await ComplaintController.getComplaintById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(ComplaintService.getComplaintById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockComplaint,
        message: "Complaint fetched successfully",
        timestamp: expect.any(String),
      });
    });

    it("should return 404 when complaint not found", async () => {
      mockRequest.params = { id: "999" };
      (ComplaintService.getComplaintById as jest.Mock).mockResolvedValue(null);

      await ComplaintController.getComplaintById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "Complaint not found",
        timestamp: expect.any(String),
      });
    });
  });

  describe("getComplaintsByUserId", () => {
    it("should return complaints for a specific user", async () => {
      const mockComplaints = [
        {
          complaint_id: 1,
          user_id: "user123",
          category: "Technical",
          description: "Test complaint",
          status: "Pending",
          priority: "High",
          created_at: "2024-03-04T00:00:00Z",
          updated_at: "2024-03-04T00:00:00Z",
        },
      ];

      mockRequest.params = { userId: "user123" };
      (ComplaintService.getComplaintsByUserId as jest.Mock).mockResolvedValue(
        mockComplaints
      );

      await ComplaintController.getComplaintsByUserId(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(ComplaintService.getComplaintsByUserId).toHaveBeenCalledWith(
        "user123"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockComplaints,
        message: "Complaints fetched successfully",
        timestamp: expect.any(String),
      });
    });
  });

  describe("updateComplaint", () => {
    it("should update a complaint successfully", async () => {
      const mockUpdateData = {
        status: "In Progress" as ComplaintStatus,
        priority: "High" as ComplaintPriority,
        assigned_staff: "staff123",
      };

      const mockUpdatedComplaint: Complaint = {
        complaint_id: 1,
        user_id: "user123",
        category: "Technical",
        description: "Test complaint",
        ...mockUpdateData,
        created_at: "2024-03-04T00:00:00Z",
        updated_at: "2024-03-04T00:00:00Z",
      };

      mockRequest.params = { id: "1" };
      mockRequest.body = mockUpdateData;
      (ComplaintService.updateComplaint as jest.Mock).mockResolvedValue(
        mockUpdatedComplaint
      );

      await ComplaintController.updateComplaint(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(ComplaintService.updateComplaint).toHaveBeenCalledWith(
        1,
        mockUpdateData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedComplaint,
        message: "Complaint updated successfully",
        timestamp: expect.any(String),
      });
    });
  });

  describe("deleteComplaint", () => {
    it("should delete a complaint successfully", async () => {
      mockRequest.params = { id: "1" };
      (ComplaintService.deleteComplaint as jest.Mock).mockResolvedValue(
        undefined
      );

      await ComplaintController.deleteComplaint(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(ComplaintService.deleteComplaint).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "Complaint deleted successfully",
        timestamp: expect.any(String),
      });
    });
  });
});
