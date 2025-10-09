import { z } from "zod";

/**
 * Zod validation schemas for message-related routes.
 * Validates message creation with mentions support.
 */

// Message text validation: 1-2000 chars
export const messageTextSchema = z
  .string()
  .min(1, "Message cannot be empty")
  .max(2000, "Message must be at most 2000 characters")
  .trim();

// Mentions validation: array of user/item IDs
export const mentionsSchema = z.array(z.string()).optional().default([]);

// Create message schema
export const createMessageSchema = z.object({
  text: messageTextSchema,
  mentionsUsers: mentionsSchema,
  mentionsItems: mentionsSchema,
});

// Get messages schema (pagination)
export const getMessagesSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(50),
  cursor: z.string().optional(), // Last message ID for pagination
});
