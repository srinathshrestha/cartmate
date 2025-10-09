import { PrismaClient } from "./generated/prisma";

/**
 * Database connection utility for Cartmate.
 * Uses Prisma with standard PostgreSQL connection.
 * Implements singleton pattern to prevent connection exhaustion in dev mode.
 */

// Store Prisma instance on global scope in development to prevent hot-reload duplication.
const globalForPrisma = globalThis;

/**
 * Creates a new Prisma client instance.
 * @returns {PrismaClient} Configured Prisma client
 */
function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is required for database connections",
    );
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Use existing client in dev mode, create new in production
const prisma = globalForPrisma.__cartmatePrisma ?? createPrismaClient();

// Store on global scope in development to survive hot-reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__cartmatePrisma = prisma;
}

export default prisma;
