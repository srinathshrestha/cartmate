import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { verifyPassword } from "@/lib/auth/password";
import prisma from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/auth";
import { generateOTP, sendOTPEmail } from "@/lib/mailgun";

/**
 * PATCH /api/profile
 * Updates user profile information (username, email).
 */
export async function PATCH(request) {
  try {
    // Require authentication
    const { user, error } = await requireAuth();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { username, email, avatarUrl } = body;
    const isEmailChange = email && email !== user.email;

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: user.id } },
            { username },
          ],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 },
        );
      }
    }

    // Check if email is already in use by another user (only if email is being changed)
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: user.id } },
            { email },
          ],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 },
        );
      }
    }

    // Prepare update data
    const updateData = {};
    if (username) updateData.username = username;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    // Handle email change with verification
    if (isEmailChange) {
      // Set email as pending and mark as unverified
      updateData.pendingEmail = email;
      updateData.isEmailVerified = false;
      updateData.emailVerificationSentAt = new Date();

      // Generate and save OTP for new email
      const otp = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await prisma.otpCode.create({
        data: {
          userId: user.id,
          email: email,
          code: otp,
          expiresAt,
          used: false,
        },
      });

      // Send verification email to new address
      try {
        await sendOTPEmail(email, username || user.username, otp);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Continue with update even if email fails - user can resend
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        isEmailVerified: true,
        pendingEmail: true,
        emailVerificationSentAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: isEmailChange
        ? "Profile updated. Please verify your new email address."
        : "Profile updated successfully",
      user: updatedUser,
      requiresVerification: isEmailChange,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/profile
 * Deletes user account and all associated data.
 * Requires password confirmation.
 */
export async function DELETE(request) {
  try {
    // Require authentication
    const { user, error } = await requireAuth();
    if (error) return error;

    // Parse request body
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    // Get user with password hash
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!userWithPassword) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      password,
      userWithPassword.passwordHash,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 },
      );
    }

    // Delete user (cascade will delete all related data)
    // Prisma will automatically delete:
    // - List memberships
    // - Created lists (and their items, messages, invites)
    // - Messages
    // - Items
    // - Invites
    // - OTP codes
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Clear auth cookie
    const response = NextResponse.json({
      message: "Account deleted successfully",
    });

    response.cookies.set("cartmate-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
