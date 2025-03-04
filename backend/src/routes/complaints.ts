import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import ComplaintController from "../controllers/ComplaintController";

const router = Router();

// Create a new complaint
router.post(
  "/",
  authMiddleware,
  ComplaintController.createComplaint.bind(ComplaintController)
);

// Get all complaints
router.get(
  "/",
  authMiddleware,
  ComplaintController.getAllComplaints.bind(ComplaintController)
);

// Get complaints by user ID
router.get(
  "/user/:userId",
  authMiddleware,
  ComplaintController.getComplaintsByUserId.bind(ComplaintController)
);

// Get complaint by ID
router.get(
  "/:id",
  authMiddleware,
  ComplaintController.getComplaintById.bind(ComplaintController)
);

// Update complaint
router.put(
  "/:id",
  authMiddleware,
  ComplaintController.updateComplaint.bind(ComplaintController)
);

// Delete complaint
router.delete(
  "/:id",
  authMiddleware,
  ComplaintController.deleteComplaint.bind(ComplaintController)
);

export default router;
