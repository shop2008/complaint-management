import ComplaintModel from "../../models/complaint";
import ComplaintService from "../../services/ComplaintService";
import {
  Complaint,
  ComplaintPriority,
  ComplaintStatus,
} from "../../types/complaint.types";

// Mock the ComplaintModel
jest.mock("../../models/complaint");

describe("ComplaintService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createComplaint", () => {
    it("should create a new complaint successfully", async () => {
      const mockComplaint = {
        user_id: "user123",
        category: "Technical",
        description: "Test complaint",
        priority: "High" as ComplaintPriority,
      };

      const mockCreatedComplaint: Complaint = {
        complaint_id: 1,
        user_id: "user123",
        category: "Technical",
        description: "Test complaint",
        status: "Pending",
        priority: "High",
        created_at: "2024-03-04T00:00:00Z",
        updated_at: "2024-03-04T00:00:00Z",
      };

      (ComplaintModel.create as jest.Mock).mockResolvedValue(
        mockCreatedComplaint
      );

      const result = await ComplaintService.createComplaint(mockComplaint);

      expect(ComplaintModel.create).toHaveBeenCalledWith(mockComplaint);
      expect(result).toEqual(mockCreatedComplaint);
    });

    it("should throw an error if complaint creation fails", async () => {
      const mockComplaint = {
        user_id: "user123",
        category: "Technical",
        description: "Test complaint",
      };

      (ComplaintModel.create as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        ComplaintService.createComplaint(mockComplaint)
      ).rejects.toThrow("Database error");
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
        priority: "Medium",
        created_at: "2024-03-04T00:00:00Z",
        updated_at: "2024-03-04T00:00:00Z",
      };

      (ComplaintModel.findById as jest.Mock).mockResolvedValue(mockComplaint);

      const result = await ComplaintService.getComplaintById(1);

      expect(ComplaintModel.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockComplaint);
    });

    it("should return null when complaint not found", async () => {
      (ComplaintModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await ComplaintService.getComplaintById(999);

      expect(ComplaintModel.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
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
        status: "In Progress",
        priority: "High",
        assigned_staff: "staff123",
        created_at: "2024-03-04T00:00:00Z",
        updated_at: "2024-03-04T00:00:00Z",
      };

      (ComplaintModel.update as jest.Mock).mockResolvedValue(
        mockUpdatedComplaint
      );

      const result = await ComplaintService.updateComplaint(1, mockUpdateData);

      expect(ComplaintModel.update).toHaveBeenCalledWith(1, mockUpdateData);
      expect(result).toEqual(mockUpdatedComplaint);
    });

    it("should throw an error if complaint update fails", async () => {
      const mockUpdateData = {
        status: "In Progress" as ComplaintStatus,
      };

      (ComplaintModel.update as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      await expect(
        ComplaintService.updateComplaint(1, mockUpdateData)
      ).rejects.toThrow("Update failed");
    });
  });
});
