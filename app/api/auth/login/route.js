import { NextResponse } from "next/server";
import { setTokenCookie, signToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import prisma from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

/**
 * POST /api/auth/login
 * Authenticates user and issues JWT token.
 * Validates credentials against database.
 */
export async function POST(request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        avatarUrl: true,
      },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = await signToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    // Set token in httpOnly cookie
    await setTokenCookie(token);

    // Return user data (exclude password hash)
    const { passwordHash, ...userData } = user;

    return NextResponse.json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error during login" },
      { status: 500 },
    );
  }
}
