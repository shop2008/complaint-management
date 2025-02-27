import axiosInstance from "./axiosConfig";
import { User, UserRole } from "../types/user.types";

export interface AuthResponse {
  user: User;
  token: string;
}

const usersApi = {
  /**
   * Register a new user
   * @param data - The user registration data
   * @returns The created user and authentication token
   */
  async register(data: {
    user_id: string;
    full_name: string;
    email: string;
    role?: UserRole;
  }): Promise<User> {
    const response = await axiosInstance.post("/users/register", data);
    return response.data;
  },

  /**
   * Get the current user's profile
   * @returns The user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  },

  /**
   * Get all staff members
   * @returns The staff members
   */
  async getStaffMembers(): Promise<User[]> {
    const response = await axiosInstance.get("/users/staff");
    return response.data;
  },

  /**
   * Get a user by ID
   * @param userId - The user ID to get
   * @returns The user
   */
  async getUserById(userId: string): Promise<User> {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get all users with pagination and search
   * @param page - The page number
   * @param pageSize - The number of users per page
   * @param search - Optional search query
   * @returns The users and total count
   */
  async getAllUsers(
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ): Promise<{ users: User[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(search && { search }),
    });
    const response = await axiosInstance.get(`/users?${params}`);
    return response.data;
  },

  /**
   * Update a user's role
   * @param userId - The user ID to update
   * @param role - The new role
   * @returns The updated user
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    const response = await axiosInstance.patch(`/users/${userId}/role`, {
      role,
    });
    return response.data;
  },
};

export default usersApi;
