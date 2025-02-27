import { RowDataPacket } from "mysql2";
import db from "../config/database";
import { User, UserRole } from "../types/user.types";

export interface CreateUserDto {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
}

class UserModel {
  async create(user: CreateUserDto): Promise<User> {
    const [result] = await db.execute(
      "INSERT INTO Users (user_id, full_name, email, role) VALUES (?, ?, ?, ?)",
      [user.user_id, user.full_name, user.email, user.role]
    );

    const [newUser] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Users WHERE user_id = ?",
      [user.user_id]
    );

    return newUser[0] as User;
  }

  async findById(userId: string): Promise<User | null> {
    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Users WHERE user_id = ?",
      [userId]
    );

    return (users[0] as User) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    return (users[0] as User) || null;
  }

  async findStaffMembers(): Promise<User[]> {
    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM Users WHERE role IN ('Manager', 'Staff')"
    );

    return users as User[];
  }

  async findAll(
    page: number,
    pageSize: number,
    search?: string
  ): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const searchCondition = search
      ? "WHERE full_name LIKE ? OR email LIKE ?"
      : "";
    const searchValue = search ? `%${search}%` : "";
    const values = search
      ? [searchValue, searchValue, pageSize, offset]
      : [pageSize, offset];

    const [users] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM Users ${searchCondition} 
       ORDER BY created_at DESC LIMIT ${Number(pageSize)} OFFSET ${Number(
        offset
      )}`,
      values
    );

    const [totalResult] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM Users ${searchCondition}`,
      search ? [searchValue, searchValue] : []
    );

    return {
      users: users as User[],
      total: totalResult[0].total,
    };
  }

  async updateRole(userId: string, role: UserRole): Promise<User | null> {
    await db.execute("UPDATE Users SET role = ? WHERE user_id = ?", [
      role,
      userId,
    ]);

    return this.findById(userId);
  }
}

export default new UserModel();
