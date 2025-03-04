import UserModel, { CreateUserDto } from "../models/user";
import { User, UserRole } from "../types/user.types";
import logger from "../config/logger";

class UserService {
  private userModel: typeof UserModel;

  constructor() {
    this.userModel = UserModel;
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      logger.info("Creating new user", { email: userData.email });
      const existingUser = await this.userModel.findByEmail(userData.email);

      if (existingUser) {
        logger.warn("User already exists", { email: userData.email });
        throw new Error("User with this email already exists");
      }

      const user = await this.userModel.create(userData);
      logger.info("User created successfully", { userId: user.user_id });
      return user;
    } catch (error) {
      logger.error("Error creating user", { error, email: userData.email });
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      logger.info("Fetching user by ID", { userId });
      const user = await this.userModel.findById(userId);

      if (!user) {
        logger.warn("User not found", { userId });
      }

      return user;
    } catch (error) {
      logger.error("Error fetching user", { error, userId });
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      logger.info("Fetching user by email", { email });
      const user = await this.userModel.findByEmail(email);

      if (!user) {
        logger.warn("User not found", { email });
      }

      return user;
    } catch (error) {
      logger.error("Error fetching user by email", { error, email });
      throw error;
    }
  }

  async getAllUsers(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ users: User[]; total: number }> {
    try {
      logger.info("Fetching all users", { page, pageSize });
      return await this.userModel.findAll(page, pageSize);
    } catch (error) {
      logger.error("Error fetching users", { error, page, pageSize });
      throw error;
    }
  }

  async getStaffMembers(): Promise<User[]> {
    try {
      logger.info("Fetching staff members");
      return await this.userModel.findStaffMembers();
    } catch (error) {
      logger.error("Error fetching staff members", { error });
      throw error;
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User | null> {
    try {
      logger.info("Updating user role", { userId, role });
      const user = await this.userModel.updateRole(userId, role);

      if (!user) {
        logger.warn("User not found for role update", { userId });
      } else {
        logger.info("User role updated successfully", { userId, role });
      }

      return user;
    } catch (error) {
      logger.error("Error updating user role", { error, userId, role });
      throw error;
    }
  }
}

export default new UserService();
