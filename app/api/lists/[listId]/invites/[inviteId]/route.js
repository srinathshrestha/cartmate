import { NextResponse } from "next/server";
import { requireAuth, requireListMembership } from "@/lib/auth/helpers";
import prisma from "@/lib/db";

/**
 * PATCH /api/lists/[listId]/invites/[inviteId]
 * Updates invite properties (e.g., deactivate).
 * Only creator can update invites.
 */
export async function PATCH(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { listId, inviteId } = await params;

    // Require creator role
    const { error: membershipError } = await requireListMembership(
      user.id,
      listId,
      ["CREATOR"],
    );
    if (membershipError) return membershipError;

    // Parse request body
    const body = await request.json();
    const { isActive } = body;

    // Validate
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 },
      );
    }

    // Check if invite exists and belongs to this list
    const existingInvite = await prisma.invite.findUnique({
      where: { id: inviteId },
    });

    if (!existingInvite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (existingInvite.listId !== listId) {
      return NextResponse.json(
        { error: "Invite does not belong to this list" },
        { status: 403 },
      );
    }

    // Update invite
    const updatedInvite = await prisma.invite.update({
      where: { id: inviteId },
      data: { isActive },
    });

    return NextResponse.json({
      message: "Invite updated successfully",
      invite: updatedInvite,
    });
  } catch (error) {
    console.error("Update invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/lists/[listId]/invites/[inviteId]
 * Permanently deletes an invite.
 * Only creator can delete invites.
 */
export async function DELETE(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { listId, inviteId } = await params;

    // Require creator role
    const { error: membershipError } = await requireListMembership(
      user.id,
      listId,
      ["CREATOR"],
    );
    if (membershipError) return membershipError;

    // Check if invite exists and belongs to this list
    const existingInvite = await prisma.invite.findUnique({
      where: { id: inviteId },
    });

    if (!existingInvite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (existingInvite.listId !== listId) {
      return NextResponse.json(
        { error: "Invite does not belong to this list" },
        { status: 403 },
      );
    }

    // Delete invite
    await prisma.invite.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({
      message: "Invite deleted successfully",
    });
  } catch (error) {
    console.error("Delete invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
