export type UserRole = "student" | "professor";

export type SessionUser = {
  id: string;
  role: UserRole;
};
