import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import ComplaintUpdateController from "../controllers/ComplaintUpdateController";

const router = Router();

/**
 * @swagger
 * /api/complaint-updates:
 *   post:
 *     summary: Create a new complaint update
 *     tags: [Complaint Updates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - complaint_id
 *               - status
 *               - description
 *             properties:
 *               complaint_id:
 *                 type: integer
 *                 description: ID of the complaint being updated
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Resolved, Closed]
 *                 description: New status of the complaint
 *               description:
 *                 type: string
 *                 description: Description of the update
 *               updated_by:
 *                 type: string
 *                 description: ID of the user making the update
 *     responses:
 *       201:
 *         description: Update created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 update_id:
 *                   type: integer
 *                 complaint_id:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 description:
 *                   type: string
 *                 updated_by:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Complaint not found
 */

/**
 * @swagger
 * /api/complaint-updates/{complaintId}:
 *   get:
 *     summary: Get all updates for a complaint
 *     tags: [Complaint Updates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the complaint
 *     responses:
 *       200:
 *         description: List of complaint updates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   update_id:
 *                     type: integer
 *                   complaint_id:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   description:
 *                     type: string
 *                   updated_by:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Complaint not found
 */

/**
 * @swagger
 * /api/complaint-updates/{complaintId}/latest:
 *   get:
 *     summary: Get the latest update for a complaint
 *     tags: [Complaint Updates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the complaint
 *     responses:
 *       200:
 *         description: Latest complaint update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 update_id:
 *                   type: integer
 *                 complaint_id:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 description:
 *                   type: string
 *                 updated_by:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Complaint or update not found
 */

/**
 * @swagger
 * /api/complaint-updates/{id}:
 *   delete:
 *     summary: Delete a complaint update
 *     tags: [Complaint Updates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the update to delete
 *     responses:
 *       200:
 *         description: Update deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Update not found
 */

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
