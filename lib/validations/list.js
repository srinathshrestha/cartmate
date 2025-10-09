import { z } from "zod";

/**
 * Zod validation schemas for list-related routes.
 * Validates list creation, updates, invites, and member management.
 */

// List name validation: 1-100 chars
export const listNameSchema = z
  .string()
  .min(1, "List name is required")
  .max(100, "List name must be at most 100 characters")
  .trim();

// Create list schema
export const createListSchema = z.object({
  name: listNameSchema,
});

// Update list schema
export const updateListSchema = z.object({
  name: listNameSchema,
});

// Member role validation
export const memberRoleSchema = z.enum(["CREATOR", "EDITOR", "VIEWER"], {
  errorMap: () => ({
    message: "Invalid role. Must be CREATOR, EDITOR, or VIEWER",
  }),
});

// Update member role schema
export const updateMemberRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: memberRoleSchema,
});

// Remove member schema
export const removeMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Create invite schema
export const createInviteSchema = z.object({
  expiresInHours: z.number().int().min(1).max(168).optional().default(24), // 1 hour to 7 days
});

// Accept invite schema (token from URL params)
export const acceptInviteSchema = z.object({
  token: z.string().uuid("Invalid invite token format"),
});
