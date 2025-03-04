import { Router } from "express";
import AttachmentController from "../controllers/AttachmentController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/attachments:
 *   post:
 *     summary: Upload a new attachment for a complaint
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - complaint_id
 *               - file
 *             properties:
 *               complaint_id:
 *                 type: integer
 *                 description: ID of the complaint to attach the file to
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attachment'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Complaint not found
 *       413:
 *         description: File too large
 */

/**
 * @swagger
 * /api/attachments/{complaintId}:
 *   get:
 *     summary: Get all attachments for a complaint
 *     tags: [Attachments]
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
 *         description: List of attachments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attachment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Complaint not found
 */

/**
 * @swagger
 * /api/attachments/{id}:
 *   get:
 *     summary: Get a specific attachment
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the attachment
 *     responses:
 *       200:
 *         description: Attachment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attachment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attachment not found
 *
 *   delete:
 *     summary: Delete an attachment
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the attachment to delete
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attachment not found
 */

// Create an attachment
router.post(
  "/",
  authMiddleware,
  AttachmentController.createAttachment.bind(AttachmentController)
);

// Get complaint attachments
router.get(
  "/:complaintId",
  authMiddleware,
  AttachmentController.getAttachmentsByComplaintId.bind(AttachmentController)
);

// Delete attachment
router.delete(
  "/:id",
  authMiddleware,
  AttachmentController.deleteAttachment.bind(AttachmentController)
);

export default router;
