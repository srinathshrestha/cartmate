import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";
import prisma from "@/lib/db";

/**
 * POST /api/invites/[token]/accept
 * Accepts an invite and adds user to the list.
 * Validates token and expiry before adding member.
 */
export async function POST(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { token } = await params;

    // Find invite by token
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        list: {
          select: {
            id: true,
            name: true,
            creatorId: true,
            memberCap: true,
          },
        },
      },
    });

    // Check if invite exists
    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite token" },
        { status: 404 },
      );
    }

    // Check if invite is active
    if (!invite.isActive) {
      return NextResponse.json(
        { error: "This invite link has been deactivated" },
        { status: 410 },
      );
    }

    // Check if invite has expired
    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "Invite has expired" },
        { status: 410 },
      );
    }

    // Check if invite has reached max uses
    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
      return NextResponse.json(
        { error: "This invite has reached its maximum capacity" },
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
        { error: "You are already a member of this list" },
        { status: 409 },
      );
    }

    // Check if list has reached member cap
    if (invite.list.memberCap) {
      const memberCount = await prisma.listMember.count({
        where: { listId: invite.listId },
      });

      if (memberCount >= invite.list.memberCap) {
        return NextResponse.json(
          { error: "This list has reached its maximum number of members" },
          { status: 410 },
        );
      }
    }

    // Add user to list as EDITOR and increment usedCount
    const [member] = await prisma.$transaction([
      // Create member
      prisma.listMember.create({
        data: {
          listId: invite.listId,
          userId: user.id,
          role: "EDITOR",
        },
        include: {
          list: {
            select: {
              id: true,
              name: true,
              creatorId: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),
      // Increment invite used count
      prisma.invite.update({
        where: { id: invite.id },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      }),
    ]);

    // TODO: Publish member join event to Redis
    // await publishMemberUpdate(invite.listId, { type: "member:joined", member });

    return NextResponse.json({
      message: "Successfully joined the list",
      member,
      list: member.list,
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
