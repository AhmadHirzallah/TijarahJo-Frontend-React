import type { UserRole } from "../types";

export function normalizeUserRole(value: unknown): UserRole {
  if (typeof value !== "string") return "user";

  switch (value.trim().toLowerCase()) {
    case "admin":
      return "admin";
    case "moderator":
      return "moderator";
    default:
      return "user";
  }
}
