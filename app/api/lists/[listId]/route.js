import { NextResponse } from "next/server";
import { requireAuth, requireListMembership } from "@/lib/auth/helpers";
import prisma from "@/lib/db";
import { updateListSchema } from "@/lib/validations/list";

/**
 * GET /api/lists/[listId]
 * Fetches full list details including items, members, and recent messages.
 * Requires user to be a member of the list.
 */
export async function GET(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { listId } = await params;

    // Require list membership
    const { error: membershipError } = await requireListMembership(
      user.id,
      listId,
    );
    if (membershipError) return membershipError;

    // Fetch full list data
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        items: {
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            purchasedBy: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                subItems: true,
                attachments: true,
              },
            },
          },
          orderBy: [
            { status: "asc" },
            { priority: "desc" },
            { createdAt: "desc" },
          ],
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50, // Load last 50 messages
        },
      },
    });

    return NextResponse.json({ list });
  } catch (error) {
    console.error("Get list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/lists/[listId]
 * Updates list details (name).
 * Only creator can update the list.
 */
export async function PATCH(request, { params }) {
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
    const validation = updateListSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name } = validation.data;

    // Update list
    const updatedList = await prisma.list.update({
      where: { id: listId },
      data: { name },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "List updated successfully",
      list: updatedList,
    });
  } catch (error) {
    console.error("Update list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/lists/[listId]
 * Deletes a list permanently.
 * Only creator can delete the list.
 * Cascades to delete all items, messages, members, and invites.
 */
export async function DELETE(request, { params }) {
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

    // Delete list (cascades to related records)
    await prisma.list.delete({
      where: { id: listId },
    });

    return NextResponse.json({
      message: "List deleted successfully",
    });
  } catch (error) {
    console.error("Delete list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
