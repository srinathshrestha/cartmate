import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import prisma from "@/lib/db";

/**
 * GET /api/auth/me
 * Returns current authenticated user data from JWT token.
 */
export async function GET() {
  try {
    // Get user from JWT cookie
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
