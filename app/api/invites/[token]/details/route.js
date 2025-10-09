import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import prisma from "@/lib/db";

/**
 * GET /api/invites/[token]/details
 *
 * Fetches invitation details without accepting it.
 * This allows users to see list information before joining.
 *
 * Security:
 * - Requires authentication
 * - Does not modify any data
 * - Returns only safe, public information
 * - Validates token exists and is active
 */
export async function GET(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { token } = await params;

    // Find invite by token
    // Include list details but limit sensitive information
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        list: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            // Count members for display
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });

    // Check if invite exists
    if (!invite) {
      return NextResponse.json(
        {
          error: "Invalid invite link. This invitation may have been deleted.",
        },
        { status: 404 },
      );
    }

    // Check if invite is active
    if (!invite.isActive) {
      return NextResponse.json(
        { error: "This invite link has been deactivated by the list creator." },
        { status: 410 },
      );
    }

    // Check if invite has expired
    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "This invite has expired. Please ask for a new invite link." },
        { status: 410 },
      );
    }

    // Check if invite has reached max uses
    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
      return NextResponse.json(
        {
          error:
            "This invite has reached its maximum capacity. No more members can join.",
        },
        { status: 410 },
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.listMember.findUnique({
      where: {
        listId_userId: {
          listId: invite.listId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this list." },
        { status: 409 },
      );
    }

    // Return invite details with sanitized information
    return NextResponse.json({
      invite: {
        token: invite.token,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        usedCount: invite.usedCount,
        list: {
          id: invite.list.id,
          name: invite.list.name,
          memberCount: invite.list._count.members,
        },
      },
    });
  } catch (error) {
    console.error("Get invite details error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
