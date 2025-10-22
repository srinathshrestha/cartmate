import { z } from "zod";

/**
 * Zod validation schemas for item-related routes.
 * Validates item creation, updates, and toggle operations.
 */

// Enums for new fields
export const itemStatusSchema = z.enum(["TODO", "IN_PROGRESS", "PURCHASED", "CANCELLED"]);
export const itemPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const unitSchema = z.enum(["PIECE", "PACK", "DOZEN", "G", "KG", "OZ", "ML", "L", "CUSTOM"]);
export const itemCategorySchema = z.enum(["DAIRY", "GRAINS", "PRODUCE", "MEAT", "BEVERAGE", "HOUSEHOLD", "OTHER"]).optional();

// Item name validation: 1-200 chars
export const itemNameSchema = z
  .string()
  .min(1, "Item name is required")
  .max(200, "Item name must be at most 200 characters")
  .trim();

// Quantity validation: now required, 1-50 chars (can be "2kg", "1 dozen", etc.)
export const quantitySchema = z
  .string()
  .min(1, "Quantity is required")
  .max(50, "Quantity must be at most 50 characters");

// Numeric quantity for structured units
export const quantityNumberSchema = z
  .number()
  .positive("Quantity must be greater than 0")
  .max(999999.99, "Quantity too large")
  .optional();

// Custom unit validation (only when unit is CUSTOM)
export const customUnitSchema = z
  .string()
  .max(20, "Custom unit must be at most 20 characters")
  .optional();

// Tags validation: array of strings, max 15 tags, each max 20 chars
export const tagsSchema = z
  .array(
    z.string().max(20, "Each tag must be at most 20 characters").trim()
  )
  .max(15, "Maximum 15 tags allowed")
  .default([]);

// Notes validation: optional, max 500 chars
export const notesSchema = z
  .string()
  .max(500, "Notes must be at most 500 characters")
  .optional();

// Price validation: cents (integer) and currency
export const priceCentsSchema = z
  .number()
  .int("Price must be a whole number of cents")
  .min(0, "Price cannot be negative")
  .max(99999999, "Price too large")
  .optional();

export const currencySchema = z
  .string()
  .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter ISO code (e.g., USD)")
  .optional();

// Date validation for due dates
export const dueAtSchema = z
  .string()
  .datetime("Invalid date format")
  .optional();

// Assignee ID validation (cuid format)
export const assigneeIdSchema = z
  .string()
  .regex(/^[a-z0-9]{25}$/, "Invalid user ID format")
  .optional();

// Create item schema - name, quantity, and unit are required
export const createItemSchema = z.object({
  name: itemNameSchema,
  quantity: quantitySchema,
  unit: unitSchema,
  quantityNumber: quantityNumberSchema,
  customUnit: customUnitSchema,
  status: itemStatusSchema.optional().default("TODO"),
  priority: itemPrioritySchema.optional().default("MEDIUM"),
  tags: tagsSchema,
  category: itemCategorySchema,
  notes: notesSchema,
  dueAt: dueAtSchema,
  assignedToId: assigneeIdSchema,
  priceCents: priceCentsSchema,
  currency: currencySchema,
  storeName: z.string().max(100).optional(),
  storeAisle: z.string().max(50).optional(),
  metadata: z.record(z.any()).optional(),
})
  .refine(
    (data) => {
      // If unit is CUSTOM, customUnit must be provided
      if (data.unit === "CUSTOM" && !data.customUnit) {
        return false;
      }
      return true;
    },
    {
      message: "Custom unit name is required when unit is CUSTOM",
      path: ["customUnit"],
    }
  );

// Update item schema (all fields optional, but at least one required)
export const updateItemSchema = z
  .object({
    name: itemNameSchema.optional(),
    quantity: quantitySchema.optional(),
    unit: unitSchema.optional(),
    quantityNumber: quantityNumberSchema,
    customUnit: customUnitSchema,
    status: itemStatusSchema.optional(),
    priority: itemPrioritySchema.optional(),
    tags: tagsSchema,
    category: itemCategorySchema,
    notes: notesSchema,
    dueAt: dueAtSchema,
    assignedToId: assigneeIdSchema,
    priceCents: priceCentsSchema,
    currency: currencySchema,
    storeName: z.string().max(100).optional(),
    storeAisle: z.string().max(50).optional(),
    metadata: z.record(z.any()).optional(),
    done: z.boolean().optional(), // Keep for backward compatibility
  })
  .refine(
    (data) => {
      // If unit is CUSTOM, customUnit must be provided
      if (data.unit === "CUSTOM" && !data.customUnit) {
        return false;
      }
      return true;
    },
    {
      message: "Custom unit name is required when unit is CUSTOM",
      path: ["customUnit"],
    }
  )
  .refine(
    (data) =>
      data.name !== undefined ||
      data.quantity !== undefined ||
      data.unit !== undefined ||
      data.quantityNumber !== undefined ||
      data.customUnit !== undefined ||
      data.status !== undefined ||
      data.priority !== undefined ||
      data.tags !== undefined ||
      data.category !== undefined ||
      data.notes !== undefined ||
      data.dueAt !== undefined ||
      data.assignedToId !== undefined ||
      data.priceCents !== undefined ||
      data.currency !== undefined ||
      data.storeName !== undefined ||
      data.storeAisle !== undefined ||
      data.metadata !== undefined ||
      data.done !== undefined,
    {
      message: "At least one field must be provided for update",
    },
  );

// Toggle done schema
export const toggleDoneSchema = z.object({
  done: z.boolean(),
});
