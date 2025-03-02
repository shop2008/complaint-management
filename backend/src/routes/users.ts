import { Router } from "express";
import { z } from "zod";
import logger from "../config/logger";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../middleware/errorHandler";
import UserModel from "../models/user";
import { HttpStatus } from "../types/api.types";
import { ErrorTracker } from "../utils/errorTracker";
const router = Router();

const createUserSchema = z.object({
  user_id: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  role: z.enum(["Admin", "Manager", "Staff", "Customer"]).default("Customer"),
});

const updateRoleSchema = z.object({
  role: z.enum(["Admin", "Manager", "Staff", "Customer"]),
});

const updateUserSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email().optional(),
});

// Register new user
router.post("/register", async (req, res, next) => {
  try {
    const userData = createUserSchema.parse(req.body);

    // Create user in database
    const user = await UserModel.create({
      user_id: userData.user_id,
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role,
    });

    logger.info(`New user registered: ${user.email} with role ${user.role}`);
    res
      .status(HttpStatus.CREATED)
      .json(createSuccessResponse(user, "User created successfully"));
  } catch (error: any) {
    ErrorTracker.trackError(error, "users.register", "");
    next(error);
  }
});

// Get current user profile
router.get("/me", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await UserModel.findByEmail(req.user?.email || "");
    if (!user) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json(
          createErrorResponse(
            "User not found",
            "User not found",
            HttpStatus.NOT_FOUND
          )
        );
    }
    res
      .status(HttpStatus.OK)
      .json(createSuccessResponse(user, "User fetched successfully"));
  } catch (error: any) {
    ErrorTracker.trackError(error, "users.me", req.user?.uid);
    next(error);
  }
});

// Get all staff members
router.get("/staff", authMiddleware, async (req, res, next) => {
  try {
    const staffMembers = await UserModel.findStaffMembers();
    res
      .status(HttpStatus.OK)
      .json(
        createSuccessResponse(
          staffMembers,
          "Staff members fetched successfully"
        )
      );
  } catch (error: any) {
    ErrorTracker.trackError(
      error,
      "users.staff",
      (req as AuthRequest).user?.uid
    );
    next(error);
  }
});

// Get user by ID
router.get("/:userId", authMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json(
          createErrorResponse(
            "User not found",
            "User not found",
            HttpStatus.NOT_FOUND
          )
        );
    }
    res
      .status(HttpStatus.OK)
      .json(createSuccessResponse(user, "User fetched successfully"));
  } catch (error: any) {
    ErrorTracker.trackError(
      error,
      "users.getById",
      (req as AuthRequest).user?.uid
    );
    next(error);
  }
});

// Get all users (Admin only)
router.get("/", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    // Check if user is admin
    const user = await UserModel.findByEmail(req.user?.email || "");
    if (!user || user.role !== "Admin") {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json(
          createErrorResponse(
            "Access denied",
            "Only admins can access this resource",
            HttpStatus.FORBIDDEN
          )
        );
    }

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const result = await UserModel.findAll(page, pageSize);
    res
      .status(HttpStatus.OK)
      .json(createSuccessResponse(result, "Users fetched successfully"));
  } catch (error) {
    next(error);
  }
});

// Update user role (Admin only)
router.patch(
  "/:userId/role",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      // Check if user is admin
      const user = await UserModel.findByEmail(req.user?.email || "");
      if (!user || user.role !== "Admin") {
        return res
          .status(HttpStatus.FORBIDDEN)
          .json(
            createErrorResponse(
              "Access denied",
              "Only admins can update user roles",
              HttpStatus.FORBIDDEN
            )
          );
      }

      const { role } = updateRoleSchema.parse(req.body);
      const targetUser = await UserModel.findById(req.params.userId);

      if (!targetUser) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(
            createErrorResponse(
              "User not found",
              "User not found",
              HttpStatus.NOT_FOUND
            )
          );
      }

      // Prevent admin from changing their own role
      if (targetUser.user_id === user.user_id) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createErrorResponse(
              "Invalid operation",
              "Cannot change your own role",
              HttpStatus.BAD_REQUEST
            )
          );
      }

      const updatedUser = await UserModel.updateRole(req.params.userId, role);
      logger.info(`Updated role for user ${req.params.userId} to ${role}`);

      res
        .status(HttpStatus.OK)
        .json(
          createSuccessResponse(updatedUser, "User role updated successfully")
        );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
