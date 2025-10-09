import { NextResponse } from "next/server";
import { removeTokenCookie } from "@/lib/auth/jwt";

/**
 * POST /api/auth/logout
 * Logs out user by removing JWT token cookie.
 */
export async function POST() {
  try {
    // Remove JWT cookie
    await removeTokenCookie();

    return NextResponse.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error during logout" },
      { status: 500 },
    );
  }
}
