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
        {
          complaint_id: 2,
          user_id: "user456",
          category: "Billing",
          description: "Test complaint 2",
          status: "In Progress",
          priority: "Medium",
          created_at: "2024-03-04T00:00:00Z",
          updated_at: "2024-03-04T00:00:00Z",
        },
      ];

      const mockResponse = {
        complaints: mockComplaints,
        total: 2,
      };

      const filters = { status: "Pending", priority: "High" };
      (ComplaintModel.findAll as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ComplaintService.getAllComplaints(1, 10, filters);

      expect(ComplaintModel.findAll).toHaveBeenCalledWith(1, 10, filters);
      expect(result).toEqual(mockResponse);
    });

    it("should throw an error if fetching complaints fails", async () => {
      (ComplaintModel.findAll as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(ComplaintService.getAllComplaints(1, 10)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getComplaintsByUserId", () => {
    it("should return complaints for a specific user", async () => {
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
        {
          complaint_id: 2,
          user_id: "user123",
          category: "Billing",
          description: "Test complaint 2",
          status: "In Progress",
          priority: "Medium",
          created_at: "2024-03-04T00:00:00Z",
          updated_at: "2024-03-04T00:00:00Z",
        },
      ];

      (ComplaintModel.findByUserId as jest.Mock).mockResolvedValue(
        mockComplaints
      );

      const result = await ComplaintService.getComplaintsByUserId("user123");

      expect(ComplaintModel.findByUserId).toHaveBeenCalledWith("user123");
      expect(result).toEqual(mockComplaints);
    });

    it("should throw an error if fetching user complaints fails", async () => {
      (ComplaintModel.findByUserId as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        ComplaintService.getComplaintsByUserId("user123")
      ).rejects.toThrow("Database error");
    });
  });

  describe("deleteComplaint", () => {
    it("should delete a complaint successfully", async () => {
      (ComplaintModel.delete as jest.Mock).mockResolvedValue(undefined);

      await ComplaintService.deleteComplaint(1);

      expect(ComplaintModel.delete).toHaveBeenCalledWith(1);
    });

    it("should throw an error if complaint deletion fails", async () => {
      (ComplaintModel.delete as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      await expect(ComplaintService.deleteComplaint(1)).rejects.toThrow(
        "Delete failed"
      );
    });
  });
});
