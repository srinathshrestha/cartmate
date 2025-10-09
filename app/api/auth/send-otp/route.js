import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateOTP, sendOTPEmail } from "@/lib/mailgun";

/**
 * POST /api/auth/send-otp
 * Sends OTP code to user's email for verification.
 * Can be used for registration or re-sending verification.
 */
export async function POST(request) {
  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email and userId are required" },
        { status: 400 },
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email matches
    if (user.email !== email) {
      return NextResponse.json(
        { error: "Email does not match user account" },
        { status: 400 },
      );
    }

    // Delete any existing unused OTP codes for this user
    await prisma.otpCode.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // Generate new OTP
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

    // Send OTP email
    try {
      await sendOTPEmail(user.email, user.username, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Verification code sent to your email",
      email: user.email,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
