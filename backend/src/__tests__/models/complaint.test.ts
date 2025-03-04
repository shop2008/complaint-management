import db from "../../config/database";
import ComplaintModel from "../../models/complaint";
import { ComplaintPriority } from "../../types/complaint.types";

// Mock the database module
jest.mock("../../config/database", () => ({
  execute: jest.fn(),
}));

describe("ComplaintModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new complaint with default priority", async () => {
      const mockComplaint = {
        user_id: "user123",
        category: "Technical",
        description: "Test complaint",
      };

      const mockInsertResult = { insertId: 1 };
      const mockSelectResult = [
        {
          complaint_id: 1,
          user_id: "user123",
          category: "Technical",
          description: "Test complaint",
          status: "Pending",
          priority: "Medium",
          created_at: "2024-03-04T00:00:00Z",
          updated_at: "2024-03-04T00:00:00Z",
        },
      ];

      (db.execute as jest.Mock)
        .mockResolvedValueOnce([mockInsertResult])
        .mockResolvedValueOnce([mockSelectResult]);

      const result = await ComplaintModel.create(mockComplaint);

      expect(db.execute).toHaveBeenCalledTimes(2);
      expect(db.execute).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("INSERT INTO Complaints"),
        ["user123", "Technical", "Test complaint", "Medium"]
      );
      expect(result).toEqual(mockSelectResult[0]);
    });

    it("should create a new complaint with specified priority", async () => {
      const mockComplaint = {
        user_id: "user123",
        category: "Technical",
        description: "Test complaint",
        priority: "High" as ComplaintPriority,
      };

      const mockInsertResult = { insertId: 1 };
      const mockSelectResult = [
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

      (db.execute as jest.Mock)
        .mockResolvedValueOnce([mockInsertResult])
        .mockResolvedValueOnce([mockSelectResult]);

      const result = await ComplaintModel.create(mockComplaint);

      expect(db.execute).toHaveBeenCalledTimes(2);
      expect(db.execute).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("INSERT INTO Complaints"),
        ["user123", "Technical", "Test complaint", "High"]
      );
      expect(result).toEqual(mockSelectResult[0]);
    });
  });

  describe("findById", () => {
    it("should return a complaint when found", async () => {
      const mockComplaint = [
        {
          complaint_id: 1,
          user_id: "user123",
          category: "Technical",
          description: "Test complaint",
          status: "Pending",
          priority: "Medium",
          created_at: "2024-03-04T00:00:00Z",
          updated_at: "2024-03-04T00:00:00Z",
        },
      ];

      (db.execute as jest.Mock).mockResolvedValueOnce([mockComplaint]);

      const result = await ComplaintModel.findById(1);

      expect(db.execute).toHaveBeenCalledTimes(1);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM Complaints"),
        [1]
      );
      expect(result).toEqual(mockComplaint[0]);
    });

    it("should return null when complaint not found", async () => {
      (db.execute as jest.Mock).mockResolvedValueOnce([[]]);

      const result = await ComplaintModel.findById(999);

      expect(db.execute).toHaveBeenCalledTimes(1);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM Complaints"),
        [999]
      );
      expect(result).toBeNull();
    });
  });
});
