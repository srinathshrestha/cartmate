import { NextResponse } from "next/server";
import { requireAuth, requireListMembership } from "@/lib/auth/helpers";
import prisma from "@/lib/db";

/**
 * DELETE /api/lists/[listId]/members/[memberId]
 * Removes a member from the list.
 * Only creator can remove members.
 * Cannot remove the creator themselves.
 */
export async function DELETE(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { listId, memberId } = await params;

    // Require creator role
    const { error: membershipError } = await requireListMembership(
      user.id,
      listId,
      ["CREATOR"],
    );
    if (membershipError) return membershipError;

    // Check if member exists
    const member = await prisma.listMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (member.listId !== listId) {
      return NextResponse.json(
        { error: "Member does not belong to this list" },
        { status: 403 },
      );
    }

    // Cannot remove creator
    if (member.role === "CREATOR") {
      return NextResponse.json(
        { error: "Cannot remove the list creator" },
        { status: 400 },
      );
    }

    // Remove member
    await prisma.listMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      message: `${member.user.username} removed from list successfully`,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
