import { NextResponse } from "next/server";
import { requireAuth, requireListMembership } from "@/lib/auth/helpers";
import prisma from "@/lib/db";
import { createItemSchema } from "@/lib/validations/item";

/**
 * GET /api/lists/[listId]/items
 * Fetches all items for a list.
 * Returns items ordered by done status and creation date.
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

    // Fetch all items for the list
    const items = await prisma.item.findMany({
      where: { listId },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Get items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/lists/[listId]/items
 * Creates a new item in the list.
 * Requires EDITOR or CREATOR role.
 */
export async function POST(request, { params }) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const { listId } = await params;

    // Require EDITOR or CREATOR role
    const { error: membershipError } = await requireListMembership(
      user.id,
      listId,
      ["CREATOR", "EDITOR"],
    );
    if (membershipError) return membershipError;

    // Parse and validate request body
    const body = await request.json();
    const validation = createItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, quantity, notes } = validation.data;

    // Create item
    const item = await prisma.item.create({
      data: {
        listId,
        name,
        quantity: quantity || "1",
        notes,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // TODO: Publish to Redis for real-time sync
    // await publishItemUpdate(listId, { type: "item:created", item });

    return NextResponse.json(
      {
        message: "Item added successfully",
        item,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
