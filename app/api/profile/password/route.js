import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import prisma from "@/lib/db";
import { changePasswordSchema } from "@/lib/validations/auth";

/**
 * PATCH /api/profile/password
 * Changes user password after verifying current password.
 */
export async function PATCH(request) {
  try {
    // Require authentication
    const { user, error } = await requireAuth();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const validation = changePasswordSchema.safeParse({
      ...body,
      confirmPassword: body.newPassword, // For validation compatibility
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = validation.data;

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

    // Verify current password
    const isPasswordValid = await verifyPassword(
      currentPassword,
      userWithPassword.passwordHash,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
