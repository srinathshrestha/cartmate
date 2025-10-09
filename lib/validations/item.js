import { z } from "zod";

/**
 * Zod validation schemas for item-related routes.
 * Validates item creation, updates, and toggle operations.
 */

// Item name validation: 1-200 chars
export const itemNameSchema = z
  .string()
  .min(1, "Item name is required")
  .max(200, "Item name must be at most 200 characters")
  .trim();

// Quantity validation: 1-50 chars (can be "2kg", "1 dozen", etc.)
export const quantitySchema = z
  .string()
  .max(50, "Quantity must be at most 50 characters")
  .optional()
  .default("1");

// Notes validation: optional, max 500 chars
export const notesSchema = z
  .string()
  .max(500, "Notes must be at most 500 characters")
  .optional();

// Create item schema
export const createItemSchema = z.object({
  name: itemNameSchema,
  quantity: quantitySchema,
  notes: notesSchema,
});

// Update item schema (all fields optional, but at least one required)
export const updateItemSchema = z
  .object({
    name: itemNameSchema.optional(),
    quantity: quantitySchema,
    notes: notesSchema,
    done: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.quantity !== undefined ||
      data.notes !== undefined ||
      data.done !== undefined,
    {
      message: "At least one field must be provided for update",
    },
  );

// Toggle done schema
export const toggleDoneSchema = z.object({
  done: z.boolean(),
});
