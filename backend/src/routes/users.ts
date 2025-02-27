import { Router } from "express";
import { z } from "zod";
import UserModel from "../models/user";
import { authMiddleware, AuthRequest } from "../middleware/auth";
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

// Register new user
router.post("/register", async (req, res) => {
  try {
    const userData = createUserSchema.parse(req.body);

    // Create user in database
    const user = await UserModel.create({
      user_id: userData.user_id,
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role,
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get current user profile
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await UserModel.findByEmail(req.user?.email || "");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/staff", authMiddleware, async (req, res) => {
  try {
    const staffMembers = await UserModel.findStaffMembers();
    res.json(staffMembers);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users (Admin only)
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    const user = await UserModel.findByEmail(req.user?.email || "");
    if (!user || user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const search = req.query.search as string;

    const result = await UserModel.findAll(page, pageSize, search);
    res.json(result);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user role (Admin only)
router.patch("/:userId/role", authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    const user = await UserModel.findByEmail(req.user?.email || "");
    if (!user || user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { role } = updateRoleSchema.parse(req.body);
    const targetUser = await UserModel.findById(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent admin from changing their own role
    if (targetUser.user_id === user.user_id) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    const updatedUser = await UserModel.updateRole(req.params.userId, role);
    res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
