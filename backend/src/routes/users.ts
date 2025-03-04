import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import UserController from "../controllers/UserController";

const router = Router();

// Create a new user
router.post(
  "/register",
  authMiddleware,
  UserController.createUser.bind(UserController)
);

// Get all users
router.get(
  "/",
  authMiddleware,
  UserController.getAllUsers.bind(UserController)
);

// Get current user profile
router.get(
  "/me",
  authMiddleware,
  UserController.getCurrentUser.bind(UserController)
);

// Get staff members
router.get(
  "/staff",
  authMiddleware,
  UserController.getStaffMembers.bind(UserController)
);

// Get user by ID
router.get(
  "/:id",
  authMiddleware,
  UserController.getUserById.bind(UserController)
);

// Update user role
router.put(
  "/:id/role",
  authMiddleware,
  UserController.updateUserRole.bind(UserController)
);

export default router;
