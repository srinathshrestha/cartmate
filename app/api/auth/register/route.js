import { NextResponse } from "next/server";
import { setTokenCookie, signToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import prisma from "@/lib/db";
import { generateOTP, sendOTPEmail } from "@/lib/mailgun";
import { registerSchema } from "@/lib/validations/auth";

/**
 * POST /api/auth/register
 * Registers a new user account.
 * Creates user in database and issues JWT token.
 */
export async function POST(request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { username, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 },
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 },
        );
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user (not verified initially)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        isEmailVerified: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Generate OTP code
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Save OTP to database
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        email: user.email,
        code: otp,
        expiresAt,
        used: false,
      },
    });

    // Send OTP email (don't fail registration if email fails)
    try {
      await sendOTPEmail(user.email, user.username, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Continue with registration even if email fails
    }

    // Generate JWT token (user can access app but some features require verification)
    const token = await signToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    // Set token in httpOnly cookie
    await setTokenCookie(token);

    // Return user data
    return NextResponse.json(
      {
        message: "Registration successful. Please verify your email.",
        user,
        requiresVerification: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 },
    );
  }
}
