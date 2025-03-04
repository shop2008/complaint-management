import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import ComplaintController from "../controllers/ComplaintController";
import {
  Complaint,
  ComplaintPriority,
  ComplaintStatus,
} from "../types/complaint.types";

const router = Router();

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - category
 *               - description
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID of the user creating the complaint
 *               category:
 *                 type: string
 *                 description: The category of the complaint
 *               description:
 *                 type: string
 *                 description: Detailed description of the complaint
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 default: Medium
 *                 description: Priority level of the complaint
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get all complaints with pagination and filters
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Resolved, Closed]
 *         description: Filter by complaint status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *         description: Filter by complaint priority
 *     responses:
 *       200:
 *         description: List of complaints with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 complaints:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Complaint'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Get a complaint by ID
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       404:
 *         description: Complaint not found
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     summary: Update a complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Complaint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: Updated category of the complaint
 *               description:
 *                 type: string
 *                 description: Updated description of the complaint
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Resolved, Closed]
 *                 description: Updated status of the complaint
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 description: Updated priority level
 *               assigned_staff:
 *                 type: string
 *                 description: ID of the staff member assigned to the complaint
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       404:
 *         description: Complaint not found
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Delete a complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint deleted successfully
 *       404:
 *         description: Complaint not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/complaints/user/{userId}:
 *   get:
 *     summary: Get all complaints for a specific user
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's complaints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Complaint'
 *       401:
 *         description: Unauthorized
 */

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

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Get a complaint by ID
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The complaint ID
 *     responses:
 *       200:
 *         description: Complaint found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Complaint'
 *       404:
 *         description: Complaint not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  authMiddleware,
  ComplaintController.getComplaintById.bind(ComplaintController)
);

/**
 * @swagger
 * /api/complaints/{id}:
 *   put:
 *     summary: Update a complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The complaint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Resolved, Closed]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *               assigned_staff:
 *                 type: string
 *                 description: ID of the staff member assigned to the complaint
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Complaint'
 *       404:
 *         description: Complaint not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/:id",
  authMiddleware,
  ComplaintController.updateComplaint.bind(ComplaintController)
);

/**
 * @swagger
 * /api/complaints/{id}:
 *   delete:
 *     summary: Delete a complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The complaint ID
 *     responses:
 *       200:
 *         description: Complaint deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Complaint not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:id",
  authMiddleware,
  ComplaintController.deleteComplaint.bind(ComplaintController)
);

export default router;
