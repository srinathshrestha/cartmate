import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "./jwt";

/**
 * Helper functions for authentication in API routes.
 * Provides common patterns for user verification and authorization.
 */

/**
 * Gets authenticated user from JWT and returns error response if not found.
 * Use this in API routes that require authentication.
 *
 * @returns {Promise<{user: Object, error: null} | {user: null, error: NextResponse}>}
 */
export async function requireAuth() {
  const userPayload = await getCurrentUser();

  if (!userPayload) {
    return {
      user: null,
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  // Fetch full user data from database
  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  return { user, error: null };
}

/**
 * Checks if user is a member of a list and has required role.
 *
 * @param {string} userId - User ID
 * @param {string} listId - List ID
 * @param {string[]} allowedRoles - Allowed roles (e.g., ["CREATOR", "EDITOR"])
 * @returns {Promise<{member: Object, error: null} | {member: null, error: NextResponse}>}
 */
export async function requireListMembership(
  userId,
  listId,
  allowedRoles = null,
) {
  // Check if list exists
  const list = await prisma.list.findUnique({
    where: { id: listId },
  });

  if (!list) {
    return {
      member: null,
      error: NextResponse.json({ error: "List not found" }, { status: 404 }),
    };
  }

  // Check if user is a member
  const member = await prisma.listMember.findUnique({
    where: {
      listId_userId: {
        listId,
        userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!member) {
    return {
      member: null,
      error: NextResponse.json(
        { error: "Access denied. You are not a member of this list" },
        { status: 403 },
      ),
    };
  }

  // Check role if specified
  if (allowedRoles && !allowedRoles.includes(member.role)) {
    return {
      member: null,
      error: NextResponse.json(
        { error: `Access denied. Required role: ${allowedRoles.join(" or ")}` },
        { status: 403 },
      ),
    };
  }

  return { member, error: null };
}
