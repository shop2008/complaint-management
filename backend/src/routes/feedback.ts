import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import FeedbackController from "../controllers/FeedbackController";

const router = Router();

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit feedback for a complaint
 *     tags: [Feedback]
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
 *               - rating
 *               - comment
 *             properties:
 *               complaint_id:
 *                 type: integer
 *                 description: ID of the complaint to submit feedback for
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               comment:
 *                 type: string
 *                 description: Detailed feedback comment
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedback_id:
 *                   type: integer
 *                 complaint_id:
 *                   type: integer
 *                 rating:
 *                   type: integer
 *                 comment:
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
 * /api/feedback/{complaintId}:
 *   get:
 *     summary: Get feedback for a complaint
 *     tags: [Feedback]
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
 *         description: Complaint feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedback_id:
 *                   type: integer
 *                 complaint_id:
 *                   type: integer
 *                 rating:
 *                   type: integer
 *                 comment:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No feedback found for this complaint
 */

// Submit feedback for a complaint
router.post(
  "/",
  authMiddleware,
  FeedbackController.createFeedback.bind(FeedbackController)
);

// Get feedback for a complaint
router.get(
  "/:complaintId",
  authMiddleware,
  FeedbackController.getFeedbackByComplaintId.bind(FeedbackController)
);

export default router;
