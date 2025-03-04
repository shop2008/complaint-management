import { Request, Response, NextFunction } from "express";
import UserService from "../services/UserService";
import { createSuccessResponse } from "../middleware/errorHandler";
import { HttpStatus } from "../types/api.types";
import { UserRole } from "../types/user.types";
import {
  createUserSchema,
  updateRoleSchema,
} from "../schemas/validation.schemas";

declare module "express" {
  interface Request {
    user?: {
      uid: string;
      email: string;
    };
  }
}

class UserController {
  private readonly userService: typeof UserService;

  constructor() {
    this.userService = UserService;
  }

  // Create a new user
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = createUserSchema.parse(req.body);
      const user = await this.userService.createUser(userData);
      res
        .status(HttpStatus.CREATED)
        .json(createSuccessResponse(user, "User created successfully"));
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(createSuccessResponse(null, "User not found"));
      }

      res
        .status(HttpStatus.OK)
        .json(createSuccessResponse(user, "User fetched successfully"));
    } catch (error) {
      next(error);
    }
  }

  // Get all users
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const { users, total } = await this.userService.getAllUsers(
        page,
        pageSize
      );

      res
        .status(HttpStatus.OK)
        .json(
          createSuccessResponse(
            { users, total, page, pageSize },
            "Users fetched successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  }

  // Get staff members
  async getStaffMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const staffMembers = await this.userService.getStaffMembers();
      res
        .status(HttpStatus.OK)
        .json(
          createSuccessResponse(
            staffMembers,
            "Staff members fetched successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createSuccessResponse(null, "User not authenticated"));
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(createSuccessResponse(null, "User not found"));
      }

      res
        .status(HttpStatus.OK)
        .json(createSuccessResponse(user, "Current user fetched successfully"));
    } catch (error) {
      next(error);
    }
  }

  // Update user role
  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const { role } = updateRoleSchema.parse(req.body);
      const user = await this.userService.updateUserRole(
        userId,
        role as UserRole
      );

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(createSuccessResponse(null, "User not found"));
      }

      res
        .status(HttpStatus.OK)
        .json(createSuccessResponse(user, "User role updated successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
