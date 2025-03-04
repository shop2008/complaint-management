import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import ComplaintUpdateController from "../controllers/ComplaintUpdateController";

const router = Router();

// Create a new update
router.post(
  "/",
  authMiddleware,
  ComplaintUpdateController.createUpdate.bind(ComplaintUpdateController)
);

// Get all updates for a complaint
router.get(
  "/:complaintId",
  authMiddleware,
  ComplaintUpdateController.getUpdatesByComplaintId.bind(
    ComplaintUpdateController
  )
);

// Get latest update for a complaint
router.get(
  "/:complaintId/latest",
  authMiddleware,
  ComplaintUpdateController.getLatestUpdate.bind(ComplaintUpdateController)
);

// Delete an update
router.delete(
  "/:id",
  authMiddleware,
  ComplaintUpdateController.deleteUpdate.bind(ComplaintUpdateController)
);

export default router;
