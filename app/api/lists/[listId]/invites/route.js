import { NextResponse } from "next/server";
import { requireAuth, requireListMembership } from "@/lib/auth/helpers";
import prisma from "@/lib/db";
import { createInviteSchema } from "@/lib/validations/list";

/**
 * GET /api/lists/[listId]/invites
 * Fetches all active invites for a list.
 * Only creator can view invites.
 */
export async function GET(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { listId } = await params;

    // Require creator role
    const { error: membershipError } = await requireListMembership(
      user.id,
      listId,
      ["CREATOR"],
    );
    if (membershipError) return membershipError;

    // Fetch active invites (not expired)
    const invites = await prisma.invite.findMany({
      where: {
        listId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Get invites error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/lists/[listId]/invites
 * Creates a new invite token for the list.
 * Returns invite URL with token.
 * Supports expiry time and member cap.
 * Only creator can create invites.
 */
export async function POST(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { listId } = await params;

    // Require creator role
    const { error: membershipError } = await requireListMembership(
      user.id,
      listId,
      ["CREATOR"],
    );
    if (membershipError) return membershipError;

    // Parse and validate request body
    const body = await request.json();
    const expiresInHours = body.expiresInHours || 24;
    const maxUses = body.maxUses || null;

    // Validate expiry time (1-168 hours = 1-7 days)
    if (expiresInHours < 1 || expiresInHours > 168) {
      return NextResponse.json(
        { error: "Expiry time must be between 1 and 168 hours" },
        { status: 400 },
      );
    }

    // Validate max uses if provided
    if (maxUses !== null && (maxUses < 1 || maxUses > 100)) {
      return NextResponse.json(
        { error: "Max uses must be between 1 and 100" },
        { status: 400 },
      );
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Create invite
    const invite = await prisma.invite.create({
      data: {
        listId,
        createdById: user.id,
        expiresAt,
        maxUses,
        usedCount: 0,
        isActive: true,
      },
    });

    // Generate invite URL (client will use window.location.origin)
    // This is just the path, frontend should prepend origin
    const inviteUrl = `/invite/${invite.token}`;

    return NextResponse.json(
      {
        message: "Invite created successfully",
        invite,
        inviteUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
