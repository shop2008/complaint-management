export interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export type UserRole = "Admin" | "Manager" | "Staff" | "Customer";
